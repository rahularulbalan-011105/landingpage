-- ============================================================================
-- Constructa — FULL database setup for a FRESH Supabase project.
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- Safe to re-run (guarded with IF NOT EXISTS / OR REPLACE).
-- Includes: beta_signups (landing form) + projects + project_shares (dashboard).
-- ============================================================================

-- ── beta_signups (landing "keep me posted" form) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_type TEXT,
  robot_idea TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.beta_signups TO anon, authenticated;
GRANT ALL ON public.beta_signups TO service_role;
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a beta signup" ON public.beta_signups;
CREATE POLICY "Anyone can submit a beta signup"
  ON public.beta_signups FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) <= 320
    AND length(coalesce(user_type, '')) <= 64
    AND length(coalesce(robot_idea, '')) <= 2000
  );

-- ── projects ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'Untitled robot',
  description  TEXT NOT NULL DEFAULT '',
  content      JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  thumbnail    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT projects_title_len CHECK (char_length(title) <= 200),
  CONSTRAINT projects_desc_len  CHECK (char_length(description) <= 2000)
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx     ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS projects_user_status_idx ON public.projects (user_id, status);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx  ON public.projects (updated_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

DROP POLICY IF EXISTS "Users read own projects"   ON public.projects;
DROP POLICY IF EXISTS "Users insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users delete own projects" ON public.projects;

CREATE POLICY "Users read own projects" ON public.projects
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── project_shares ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_shares (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS project_shares_project_id_idx ON public.project_shares (project_id);
CREATE INDEX IF NOT EXISTS project_shares_token_idx      ON public.project_shares (token);

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.project_shares TO authenticated;
GRANT ALL ON public.project_shares TO service_role;

DROP POLICY IF EXISTS "Owner reads shares"   ON public.project_shares;
DROP POLICY IF EXISTS "Owner creates shares" ON public.project_shares;
DROP POLICY IF EXISTS "Owner deletes shares" ON public.project_shares;

CREATE POLICY "Owner reads shares" ON public.project_shares
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Owner creates shares" ON public.project_shares
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Owner deletes shares" ON public.project_shares
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

-- ── public read of a shared project (SECURITY DEFINER; RLS stays owner-only) ─
CREATE OR REPLACE FUNCTION public.get_shared_project(share_token TEXT)
RETURNS TABLE (
  id UUID, title TEXT, description TEXT, content JSONB, status TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, completed_at TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.title, p.description, p.content, p.status,
         p.created_at, p.updated_at, p.completed_at
  FROM public.project_shares s
  JOIN public.projects p ON p.id = s.project_id
  WHERE s.token = share_token
    AND (s.expires_at IS NULL OR s.expires_at > now())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_project(TEXT) TO anon, authenticated;
