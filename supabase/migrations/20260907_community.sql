-- Constructa — Community gallery
-- Adds "publish to community" to projects. Run in the Supabase SQL editor.
-- Additive + safe to re-run.

-- ── new columns ──────────────────────────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_public     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS author_name   TEXT,
  ADD COLUMN IF NOT EXISTS author_email  TEXT,
  ADD COLUMN IF NOT EXISTS forked_from   UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_public_idx ON public.projects (is_public, published_at DESC);

-- ── community read access ────────────────────────────────────────────────────
-- Anyone (logged in or not) may READ a project once it's published. This is
-- ADDITIVE to the owner-only policies — RLS combines policies with OR, so private
-- projects stay private and owners keep full control of their own rows.
DROP POLICY IF EXISTS "Anyone reads public projects" ON public.projects;
CREATE POLICY "Anyone reads public projects" ON public.projects
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

GRANT SELECT ON public.projects TO anon;  -- RLS still restricts to public rows only

-- ── author stamp (server-authoritative, anti-spoof) ──────────────────────────
-- When a row is (un)published, stamp the REAL author name/email from auth.users
-- and set/clear published_at. A user can't fake someone else's name/email because
-- the values come from the row's own user_id, not client input.
CREATE OR REPLACE FUNCTION public.stamp_public_author()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NEW.is_public THEN
    IF NEW.published_at IS NULL THEN NEW.published_at := now(); END IF;
    SELECT u.email,
           coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
      INTO NEW.author_email, NEW.author_name
    FROM auth.users u WHERE u.id = NEW.user_id;
  ELSE
    NEW.published_at := NULL;
    NEW.author_email := NULL;
    NEW.author_name  := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_stamp_author ON public.projects;
CREATE TRIGGER projects_stamp_author
  BEFORE INSERT OR UPDATE OF is_public ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.stamp_public_author();
