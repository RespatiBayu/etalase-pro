import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL =
  rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_key";

const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TokenClaim {
  id: string;
  amount: number;
  package_name: string | null;
  created_at: string;
}

interface TokenClaimWithOrderId extends TokenClaim {
  order_id: string;
}

interface ProfileRow {
  tokens: number;
}

// ─── GET — check if current user has pending claims ───────────────────────────

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: claims } = await supabaseAdmin
    .from("token_claims")
    .select("id, amount, package_name, created_at")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .returns<TokenClaim[]>();

  const totalPending = (claims ?? []).reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({ claims: claims ?? [], totalPending });
}

// ─── POST — claim all pending tokens (one-time per claim record) ──────────────

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all pending claims for this user
  const { data: pendingClaims, error: fetchError } = await supabaseAdmin
    .from("token_claims")
    .select("id, amount, package_name, order_id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .returns<TokenClaimWithOrderId[]>();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!pendingClaims || pendingClaims.length === 0) {
    // Get current balance to return accurate newBalance
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("tokens")
      .eq("id", user.id)
      .single()
      .returns<ProfileRow>();

    const currentTokens = (profile as ProfileRow | null)?.tokens ?? 0;
    return NextResponse.json({ claimed: 0, newBalance: currentTokens });
  }

  const totalAmount = pendingClaims.reduce((sum, c) => sum + c.amount, 0);
  const claimIds = pendingClaims.map((c) => c.id);

  // Get current balance
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tokens")
    .eq("id", user.id)
    .single()
    .returns<ProfileRow>();

  const currentTokens = (profile as ProfileRow | null)?.tokens ?? 0;
  const newBalance = currentTokens + totalAmount;

  // Update balance
  await supabaseAdmin
    .from("profiles")
    .update({ tokens: newBalance })
    .eq("id", user.id);

  // Mark claims as claimed
  await supabaseAdmin
    .from("token_claims")
    .update({ status: "claimed", claimed_at: new Date().toISOString() })
    .in("id", claimIds);

  // Record in token_transactions
  for (const claim of pendingClaims) {
    await supabaseAdmin.from("token_transactions").insert({
      user_id: user.id,
      type: "purchase",
      amount: claim.amount,
      description: claim.package_name ?? `Klaim ${claim.amount} token`,
      scalev_order_id: claim.order_id,
    });
  }

  return NextResponse.json({ claimed: totalAmount, newBalance });
}
