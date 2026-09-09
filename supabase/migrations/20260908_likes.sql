-- Constructa — Community likes / votes
-- Run in the Supabase SQL editor. Additive + safe to re-run.

-- Denormalized like tally on the project (publicly readable via the community policy).
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- One like per (project, user).
CREATE TABLE IF NOT EXISTS public.project_likes (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.project_likes TO authenticated;
GRANT ALL ON public.project_likes TO service_role;

DROP POLICY IF EXISTS "read own likes"       ON public.project_likes;
DROP POLICY IF EXISTS "like public projects" ON public.project_likes;
DROP POLICY IF EXISTS "unlike own"           ON public.project_likes;

-- A user can see their own likes (to render the filled heart)…
CREATE POLICY "read own likes" ON public.project_likes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- …like only PUBLISHED projects, and only as themselves…
CREATE POLICY "like public projects" ON public.project_likes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.is_public)
  );

-- …and remove only their own like.
CREATE POLICY "unlike own" ON public.project_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Keep projects.likes_count in sync (runs as definer so a liker can bump a tally
-- on a project they don't own, without any broad write grant).
CREATE OR REPLACE FUNCTION public.bump_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS project_likes_count ON public.project_likes;
CREATE TRIGGER project_likes_count
  AFTER INSERT OR DELETE ON public.project_likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_like_count();
