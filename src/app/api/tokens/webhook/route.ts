import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key so we can bypass RLS for token operations
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SIGNING_SECRET = process.env.SCALEV_SIGNING_SECRET ?? "";

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac("sha256", SIGNING_SECRET)
    .update(body)
    .digest("base64");
  return expected === signature;
}

// Extract token amount from Scalev product name
// Product names should contain the token count, e.g. "Starter Pack - 10 Token"
function extractTokenAmount(lineItems: ScalevLineItem[]): number {
  for (const item of lineItems) {
    const name = (item.name ?? item.product_name ?? "").toLowerCase();
    // Match patterns like "10 token", "50token", "token 100"
    const match = name.match(/(\d+)\s*token|token\s*(\d+)/i);
    if (match) {
      const amount = parseInt(match[1] ?? match[2], 10);
      return amount * (item.quantity ?? 1);
    }
  }
  return 0;
}

interface ScalevLineItem {
  name?: string;
  product_name?: string;
  quantity?: number;
}

interface ScalevOrder {
  order_id: string;
  destination_address?: { email?: string };
  customer?: { email?: string };
  line_items?: ScalevLineItem[];
  items?: ScalevLineItem[];
}

interface ScalevWebhookPayload {
  event: string;
  unique_id: string;
  timestamp: string;
  data: {
    order_id: string;
    payment_status?: string;
  };
}

async function fetchScalevOrder(orderId: string): Promise<ScalevOrder | null> {
  const apiKey = process.env.SCALEV_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://api.scalev.id/v2/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    console.error(`Scalev order fetch failed: ${res.status}`);
    return null;
  }

  const json = await res.json();
  // API may wrap in { data: ... }
  return (json.data ?? json) as ScalevOrder;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-scalev-hmac-sha256") ?? "";

  // Verify webhook signature
  if (!verifySignature(rawBody, signature)) {
    console.error("Webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: ScalevWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle payment paid events
  if (
    payload.event !== "order.payment_status_changed" ||
    payload.data?.payment_status !== "paid"
  ) {
    return NextResponse.json({ received: true });
  }

  const orderId = payload.data.order_id;
  const uniqueId = payload.unique_id;

  // Idempotency check — skip if already processed
  const { data: existing } = await supabaseAdmin
    .from("token_transactions")
    .select("id")
    .eq("scalev_order_id", orderId)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, note: "already processed" });
  }

  // Fetch full order details from Scalev API
  const order = await fetchScalevOrder(orderId);
  if (!order) {
    console.error(`Could not fetch order ${orderId}`);
    return NextResponse.json({ error: "Order fetch failed" }, { status: 500 });
  }

  // Get customer email
  const email =
    order.destination_address?.email ?? order.customer?.email ?? "";
  if (!email) {
    console.error(`No email found in order ${orderId}`);
    return NextResponse.json({ error: "No customer email" }, { status: 400 });
  }

  // Get token amount from line items
  const lineItems = order.line_items ?? order.items ?? [];
  const tokenAmount = extractTokenAmount(lineItems);
  if (tokenAmount <= 0) {
    console.error(`Could not determine token amount for order ${orderId}`);
    return NextResponse.json({ error: "Token amount unknown" }, { status: 400 });
  }

  // Find user by email
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, tokens")
    .eq("email", email)
    .single();

  if (!profile) {
    console.error(`No profile found for email ${email}`);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Add tokens + record transaction (in a transaction-like sequence)
  const newBalance = (profile.tokens ?? 0) + tokenAmount;

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ tokens: newBalance })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Token update failed:", updateError);
    return NextResponse.json({ error: "Token update failed" }, { status: 500 });
  }

  await supabaseAdmin.from("token_transactions").insert({
    user_id: profile.id,
    type: "purchase",
    amount: tokenAmount,
    description: `Pembelian ${tokenAmount} token (Order ${orderId})`,
    scalev_order_id: orderId,
  });

  console.log(
    `[Webhook] Added ${tokenAmount} tokens to ${email} (order ${orderId}, unique_id ${uniqueId})`
  );

  return NextResponse.json({ received: true, tokens_added: tokenAmount });
}
