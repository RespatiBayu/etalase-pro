-- Token claims table: stores pending token grants from purchases
-- Tokens are NOT added to profiles.tokens until user explicitly claims them.
-- This prevents duplicate crediting and ensures tokens only flow on first login.

CREATE TABLE IF NOT EXISTS token_claims (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users NOT NULL,
  order_id    text        UNIQUE NOT NULL,   -- Scalev order ID; UNIQUE ensures idempotency
  amount      integer     NOT NULL CHECK (amount > 0),
  package_name text,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'claimed')),
  created_at  timestamptz DEFAULT now(),
  claimed_at  timestamptz
);

-- RLS: users can only see their own claims
ALTER TABLE token_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON token_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_token_claims_user_pending
  ON token_claims(user_id) WHERE status = 'pending';
