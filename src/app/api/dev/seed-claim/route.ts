/**
 * POST /api/dev/seed-claim
 *
 * Simulates a Scalev purchase AND returns a one-time magic login link
 * so you can test the full flow (create user → login → claim tokens)
 * without going through the actual payment gateway.
 *
 * Protected by x-dev-secret: <SCALEV_SIGNING_SECRET> header.
 *
 * Usage from browser DevTools console:
 *
 *   fetch('/api/dev/seed-claim', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'x-dev-secret': 'ISI_SCALEV_SIGNING_SECRET_KAMU'
 *     },
 *     body: JSON.stringify({
 *       email: 'test@gmail.com',   // email user yang mau ditest
 *       amount: 30,                // jumlah token pending (default 30)
 *       order_id: 'TEST-001'       // opsional, auto-generate jika kosong
 *     })
 *   }).then(r => r.json()).then(d => {
 *     console.log(d);
 *     // Buka d.magic_link di browser untuk langsung login sebagai user itu
 *     if (d.magic_link) window.open(d.magic_link, '_blank');
 *   });
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";
const DEV_SECRET = process.env.SCALEV_SIGNING_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://etalase-pro.vercel.app";

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
  let isNewUser = false;

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
    isNewUser = true;

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
    if (claimError.code === "23505") {
      return NextResponse.json(
        { error: `Order ID "${orderId}" sudah dipakai. Gunakan order_id yang berbeda.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  // ── Generate magic login link (one-time, expires in 1 hour) ──────────────
  // User bisa langsung klik link ini untuk login tanpa password
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${APP_URL}/auth/confirm?next=/dashboard`,
      },
    });

  const magicLink = !linkError
    ? linkData?.properties?.action_link ?? null
    : null;

  return NextResponse.json({
    ok: true,
    is_new_user: isNewUser,
    user_id: userId,
    email,
    order_id: orderId,
    tokens_pending: amount,
    magic_link: magicLink,
    note: magicLink
      ? "Buka magic_link di browser untuk login langsung sebagai user ini."
      : "Tidak bisa generate magic link. Login manual via /login.",
  });
}
