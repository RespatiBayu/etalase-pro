import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SIGNING_SECRET = process.env.SCALEV_SIGNING_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://etalase-pro.vercel.app";
const GROWTH_PACK_TOKENS = 50; // default for new user signup (Growth Pack)

// ─── Signature Verification ───────────────────────────────────────────────────

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac("sha256", SIGNING_SECRET)
    .update(body)
    .digest("base64");
  return expected === signature;
}

// ─── Token Amount Extraction ──────────────────────────────────────────────────

interface ScalevLineItem {
  name?: string;
  product_name?: string;
  quantity?: number;
}

function extractTokenAmount(lineItems: ScalevLineItem[]): number {
  for (const item of lineItems) {
    const name = (item.name ?? item.product_name ?? "").toLowerCase();
    const match = name.match(/(\d+)\s*token|token\s*(\d+)/i);
    if (match) {
      return parseInt(match[1] ?? match[2], 10) * (item.quantity ?? 1);
    }
  }
  // Default to Growth Pack if product name doesn't specify token count
  return GROWTH_PACK_TOKENS;
}

// ─── Scalev Order Fetch ───────────────────────────────────────────────────────

interface ScalevOrder {
  order_id: string;
  destination_address?: { email?: string };
  customer?: { email?: string };
  line_items?: ScalevLineItem[];
  items?: ScalevLineItem[];
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
  return (json.data ?? json) as ScalevOrder;
}

// ─── User Provisioning ────────────────────────────────────────────────────────

async function provisionNewUser(email: string, tokenAmount: number): Promise<void> {
  // Create user + send invite email with set-password link
  const { data: inviteData, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${APP_URL}/auth/callback?next=/set-password`,
    });

  if (inviteError) {
    // If user already exists (was invited before), just ensure profile is approved
    console.warn(`inviteUserByEmail for ${email}:`, inviteError.message);
  }

  const userId = inviteData?.user?.id;
  if (!userId) {
    console.error(`No user ID returned for ${email}`);
    return;
  }

  // Upsert profile — set approved + tokens
  // (trigger may have already created the row; this handles both cases)
  const { error: upsertError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        role: "user",
        is_approved: true,
        tokens: tokenAmount,
      },
      { onConflict: "id" }
    );

  if (upsertError) {
    console.error("Profile upsert failed:", upsertError);
  }

  // Record transaction
  await supabaseAdmin.from("token_transactions").insert({
    user_id: userId,
    type: "purchase",
    amount: tokenAmount,
    description: `Pembelian awal ${tokenAmount} token (akun baru)`,
  });

  console.log(`[Webhook] New user ${email} created with ${tokenAmount} tokens`);
}

async function addTokensToExistingUser(
  userId: string,
  currentTokens: number,
  tokenAmount: number,
  orderId: string
): Promise<void> {
  const newBalance = currentTokens + tokenAmount;

  await supabaseAdmin
    .from("profiles")
    .update({ tokens: newBalance })
    .eq("id", userId);

  await supabaseAdmin.from("token_transactions").insert({
    user_id: userId,
    type: "purchase",
    amount: tokenAmount,
    description: `Pembelian ${tokenAmount} token (Order ${orderId})`,
    scalev_order_id: orderId,
  });

  console.log(
    `[Webhook] Added ${tokenAmount} tokens to user ${userId} (order ${orderId})`
  );
}

// ─── Webhook Payload Types ────────────────────────────────────────────────────

interface ScalevWebhookPayload {
  event: string;
  unique_id: string;
  timestamp: string;
  data: {
    order_id: string;
    payment_status?: string;
  };
}

// ─── GET Handler (Scalev URL verification ping) ───────────────────────────────

export async function GET() {
  return NextResponse.json({ status: "ok", service: "etalase-pro-webhook" });
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Empty body = Scalev connectivity test ping → respond OK
  if (!rawBody || rawBody.trim() === "") {
    return NextResponse.json({ received: true, note: "ping" });
  }

  let payload: ScalevWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify signature only for real payloads
  const signature = request.headers.get("x-scalev-hmac-sha256") ?? "";
  if (SIGNING_SECRET && !verifySignature(rawBody, signature)) {
    console.error("Webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Only handle paid orders
  if (
    payload.event !== "order.payment_status_changed" ||
    payload.data?.payment_status !== "paid"
  ) {
    return NextResponse.json({ received: true });
  }

  const orderId = payload.data.order_id;

  // Idempotency — skip if order already processed
  const { data: existing } = await supabaseAdmin
    .from("token_transactions")
    .select("id")
    .eq("scalev_order_id", orderId)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, note: "already processed" });
  }

  // Fetch full order from Scalev API
  const order = await fetchScalevOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order fetch failed" }, { status: 500 });
  }

  const email = order.destination_address?.email ?? order.customer?.email ?? "";
  if (!email) {
    return NextResponse.json({ error: "No customer email" }, { status: 400 });
  }

  const lineItems = order.line_items ?? order.items ?? [];
  const tokenAmount = extractTokenAmount(lineItems);

  // Check if user already exists
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, tokens")
    .eq("email", email)
    .returns<{ id: string; tokens: number }[]>()
    .single();

  if (!existingProfile) {
    // New user → create account + invite email + tokens
    await provisionNewUser(email, tokenAmount);
  } else {
    // Existing user → top up tokens
    await addTokensToExistingUser(
      existingProfile.id,
      existingProfile.tokens ?? 0,
      tokenAmount,
      orderId
    );
  }

  return NextResponse.json({ received: true, tokens_added: tokenAmount });
}
