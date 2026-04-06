/**
 * POST /api/dev/seed-claim
 *
 * Simulates a Scalev purchase for testing the full claim flow
 * without going through the actual payment gateway.
 *
 * Protected by SCALEV_SIGNING_SECRET header so it's safe in production.
 *
 * Usage (curl):
 *   curl -X POST https://etalase-pro.vercel.app/api/dev/seed-claim \
 *     -H "Content-Type: application/json" \
 *     -H "x-dev-secret: <SCALEV_SIGNING_SECRET>" \
 *     -d '{"email":"test@example.com","amount":30,"order_id":"TEST-001"}'
 *
 * Or from browser fetch (Vercel logs / DevTools):
 *   fetch('/api/dev/seed-claim', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', 'x-dev-secret': '<secret>' },
 *     body: JSON.stringify({ email: 'you@email.com', amount: 30 })
 *   }).then(r => r.json()).then(console.log)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";
const DEV_SECRET = process.env.SCALEV_SIGNING_SECRET ?? "";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(request: NextRequest) {
  // ── Auth: require the signing secret ─────────────────────────────────────
  const providedSecret = request.headers.get("x-dev-secret") ?? "";
  if (!DEV_SECRET || providedSecret !== DEV_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { email?: string; amount?: number; order_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, amount = 30, order_id } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const orderId = order_id ?? `TEST-${Date.now()}`;

  // ── Find or create user ───────────────────────────────────────────────────
  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select("id, tokens")
    .eq("email", email)
    .returns<{ id: string; tokens: number }[]>()
    .single();

  let userId: string;

  if (!profileData) {
    // Create new user silently (same as webhook flow)
    const { data: createData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: `dev-${crypto.randomUUID()}`,
      });

    if (createError || !createData?.user?.id) {
      return NextResponse.json(
        { error: createError?.message ?? "Failed to create user" },
        { status: 500 }
      );
    }

    userId = createData.user.id;

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert(
      { id: userId, email, role: "user", is_approved: true, tokens: 0 },
      { onConflict: "id" }
    );
  } else {
    userId = profileData.id;
  }

  // ── Insert pending claim ──────────────────────────────────────────────────
  const { error: claimError } = await supabaseAdmin.from("token_claims").insert({
    user_id: userId,
    order_id: orderId,
    amount,
    package_name: `[TEST] ${amount} token`,
    status: "pending",
  });

  if (claimError) {
    // UNIQUE violation = order already exists
    if (claimError.code === "23505") {
      return NextResponse.json(
        { error: `Order ID "${orderId}" already exists. Use a different order_id.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    user_id: userId,
    email,
    order_id: orderId,
    amount,
    note: "Pending claim created. User can now log in and claim tokens from dashboard.",
  });
}
