-- ─── Editor Projects ─────────────────────────────────────────────────────────
-- Stores saved editor sessions so users can resume editing later.
-- Full editor state (images as base64 + all layer config) lives in Supabase
-- Storage as a JSON file.  Thumbnail is a PNG preview also in Storage.
--
-- Storage bucket required (create manually in Supabase Dashboard):
--   Bucket name : editor-projects
--   Public      : false  (signed URLs used for access)
--   File size   : 50 MB
--   MIME types  : application/json, image/png
--
-- Storage path convention:
--   {user_id}/{project_id}/state.json   ← full serialised EditorSavedState
--   {user_id}/{project_id}/thumb.png    ← 480 × 480 preview PNG

CREATE TABLE IF NOT EXISTS editor_projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name        text        NOT NULL DEFAULT 'Proyek Editor',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_editor_projects_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER editor_projects_updated_at
  BEFORE UPDATE ON editor_projects
  FOR EACH ROW EXECUTE FUNCTION update_editor_projects_updated_at();

-- RLS: users can only see / modify their own projects
ALTER TABLE editor_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own editor projects"
  ON editor_projects
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast user-scoped queries
CREATE INDEX IF NOT EXISTS editor_projects_user_id_idx
  ON editor_projects (user_id, updated_at DESC);
