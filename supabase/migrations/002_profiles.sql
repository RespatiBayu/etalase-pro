-- ─── Profiles Table ───────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'user',
  is_approved boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile (needed for approval check on login)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- ─── Trigger: Auto-create profile on new auth user ───────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_approved)
  VALUES (NEW.id, NEW.email, 'user', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Insert Admin Account ────────────────────────────────────────────────────
-- Creates the auth user + profile for etalasepro.admin@gmail.com
-- Password: Bismillah100%

DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Insert into auth.users (only if not exists)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  )
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'etalasepro.admin@gmail.com',
    crypt('Bismillah100%', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the admin's id (whether just inserted or already existed)
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'etalasepro.admin@gmail.com';

  -- Insert/update profile as admin + approved
  INSERT INTO public.profiles (id, email, role, is_approved)
  VALUES (v_admin_id, 'etalasepro.admin@gmail.com', 'admin', true)
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin', is_approved = true;
END $$;
