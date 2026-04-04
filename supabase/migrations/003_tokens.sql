-- ─── Token System ─────────────────────────────────────────────────────────────

-- Add tokens column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tokens integer NOT NULL DEFAULT 0;

-- ─── Token Transactions ───────────────────────────────────────────────────────

CREATE TABLE public.token_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount          integer NOT NULL, -- positive = credit, negative = debit
  description     text NOT NULL,
  scalev_order_id text,             -- filled on purchase
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Token Packages Config ────────────────────────────────────────────────────

CREATE TABLE public.token_packages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  tokens          integer NOT NULL,
  price           integer NOT NULL, -- in IDR
  scalev_url      text NOT NULL,    -- Scalev product checkout URL
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;

-- Everyone (authenticated) can view active packages
CREATE POLICY "Authenticated users can view active packages"
  ON public.token_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Seed default packages (admin updates scalev_url after creating products in Scalev)
INSERT INTO public.token_packages (name, tokens, price, scalev_url, sort_order) VALUES
  ('Starter Pack',   30,  69000, 'https://bayurespati.com/co-ep-token-sp-30t',   1),
  ('Pro Pack',      100,  97000, 'https://bayurespati.com/co-ep-token-pp-100t',  2),
  ('Ultimate Pack', 210, 199000, 'https://bayurespati.com/co-ep-token-up-210t',  3);
