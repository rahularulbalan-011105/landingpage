-- Constructa — projects + sharing schema
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE where possible.

-- ─────────────────────────────────────────────────────────────────────────────
-- projects
-- One row per robot design. `content` holds the editor snapshot
-- (buildProjectSnapshot shape: { version, objects, electronics, ... }).
-- ─────────────────────────────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS projects_user_id_idx      ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS projects_user_status_idx  ON public.projects (user_id, status);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx   ON public.projects (updated_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

-- Owner-only access. auth.uid() is the JWT subject; RLS is the real security
-- boundary — a user can never read/write another user's rows even by guessing an id.
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

-- Keep updated_at fresh on every write (server-authoritative; clients can't spoof it).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- project_shares
-- A share is an opaque token that grants read-only access to ONE project.
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- Public read of a shared project.
-- SECURITY DEFINER so the projects table stays owner-only under RLS — anon never
-- gets a blanket SELECT grant; it can only reach a project through a live token.
-- ─────────────────────────────────────────────────────────────────────────────
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
