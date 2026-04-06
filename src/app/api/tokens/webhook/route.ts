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
const DEFAULT_NEW_USER_TOKENS = 30; // default for new user signup (Starter Pack)

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
  // Default to Starter Pack if product name doesn't specify token count
  return DEFAULT_NEW_USER_TOKENS;
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
  if (!apiKey) {
    console.error("SCALEV_API_KEY is not set");
    return null;
  }

  // Try multiple possible Scalev API endpoint patterns
  const endpoints = [
    `https://api.scalev.id/v2/orders/${orderId}`,
    `https://api.scalev.id/v1/orders/${orderId}`,
    `https://api.scalev.id/orders/${orderId}`,
  ];

  for (const url of endpoints) {
    try {
      console.log(`[Webhook] Trying Scalev API: ${url}`);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const bodyText = await res.text();
      console.log(`[Webhook] Scalev API ${url} → status=${res.status} body=${bodyText.slice(0, 300)}`);

      if (!res.ok) continue;

      let json: Record<string, unknown>;
      try {
        json = JSON.parse(bodyText) as Record<string, unknown>;
      } catch {
        continue;
      }

      return ((json.data ?? json) as ScalevOrder) || null;
    } catch (err) {
      console.error(`[Webhook] Scalev API fetch error for ${url}:`, err);
    }
  }

  return null;
}

// ─── User Provisioning ────────────────────────────────────────────────────────

async function provisionNewUser(
  email: string,
  tokenAmount: number,
  orderId: string
): Promise<void> {
  // Create account silently — no email sent until app launch
  const { data: createData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(), // random temp password; user will reset on launch
    });

  if (createError) {
    console.warn(`createUser for ${email}:`, createError.message);
  }

  const userId = createData?.user?.id;
  if (!userId) {
    console.error(`No user ID returned for ${email}`);
    return;
  }

  // Upsert profile — approved but tokens start at 0 (pending claim)
  const { error: upsertError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      { id: userId, email, role: "user", is_approved: true, tokens: 0 },
      { onConflict: "id" }
    );

  if (upsertError) {
    console.error("Profile upsert failed:", upsertError);
  }

  // Store claim — tokens will be credited when user claims on first login
  const { error: claimError } = await supabaseAdmin.from("token_claims").insert({
    user_id: userId,
    order_id: orderId,
    amount: tokenAmount,
    package_name: `Pembelian ${tokenAmount} token`,
    status: "pending",
  });

  if (claimError) {
    console.error("token_claims insert failed:", claimError);
  }

  console.log(`[Webhook] New user ${email} created, ${tokenAmount} tokens pending claim`);
}

async function queueTokensForExistingUser(
  userId: string,
  tokenAmount: number,
  orderId: string
): Promise<void> {
  // Don't directly credit — store as pending claim so user sees it in dashboard
  const { error: claimError } = await supabaseAdmin.from("token_claims").insert({
    user_id: userId,
    order_id: orderId,
    amount: tokenAmount,
    package_name: `Pembelian ${tokenAmount} token`,
    status: "pending",
  });

  if (claimError) {
    console.error("token_claims insert failed:", claimError);
  }

  console.log(`[Webhook] Queued ${tokenAmount} tokens for user ${userId} (order ${orderId})`);
}

// ─── Webhook Payload Types ────────────────────────────────────────────────────

interface ScalevWebhookPayload {
  event: string;
  unique_id: string;
  timestamp: string;
  data: {
    order_id: string;
    payment_status?: string;
    // Some Scalev events include customer info directly in payload
    customer_email?: string;
    email?: string;
    customer?: { email?: string };
    destination_address?: { email?: string };
    buyer_email?: string;
    line_items?: ScalevLineItem[];
    items?: ScalevLineItem[];
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
  console.log(`[Webhook] Processing order: ${orderId}`);

  // Idempotency — skip if order already processed (check token_claims)
  const { data: existing } = await supabaseAdmin
    .from("token_claims")
    .select("id")
    .eq("order_id", orderId)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, note: "already processed" });
  }

  // Try to get email from payload first (avoid extra API call)
  const payloadEmail =
    payload.data.customer_email ??
    payload.data.email ??
    payload.data.destination_address?.email ??
    payload.data.customer?.email ??
    payload.data.buyer_email ??
    "";

  const payloadLineItems = payload.data.line_items ?? payload.data.items ?? [];

  let email = payloadEmail;
  let lineItems = payloadLineItems;

  // If payload doesn't have email, fetch from Scalev API
  if (!email) {
    console.log(`[Webhook] Email not in payload, fetching order from Scalev API...`);
    const order = await fetchScalevOrder(orderId);
    if (!order) {
      console.error(`[Webhook] Could not fetch order ${orderId} from Scalev API`);
      // Return 200 to prevent Scalev from retrying — log for manual review
      return NextResponse.json(
        { received: true, error: "order_fetch_failed", order_id: orderId },
        { status: 200 }
      );
    }
    email = order.destination_address?.email ?? order.customer?.email ?? "";
    lineItems = order.line_items ?? order.items ?? [];
  }

  console.log(`[Webhook] Customer email: ${email}, line_items count: ${lineItems.length}`);

  if (!email) {
    return NextResponse.json({ error: "No customer email" }, { status: 400 });
  }

  const tokenAmount = extractTokenAmount(lineItems);

  // Check if user already exists
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, tokens")
    .eq("email", email)
    .returns<{ id: string; tokens: number }[]>()
    .single();

  if (!existingProfile) {
    // New user → create account silently + queue tokens as pending claim
    await provisionNewUser(email, tokenAmount, orderId);
  } else {
    // Existing user → queue tokens as pending claim
    await queueTokensForExistingUser(existingProfile.id, tokenAmount, orderId);
  }

  return NextResponse.json({ received: true, tokens_queued: tokenAmount });
}
