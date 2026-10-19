-- Constructa — stop exposing publishers' email addresses in the community.
--
-- WHY: `GRANT SELECT ON public.projects TO anon` + the "Anyone reads public
-- projects" policy make every column of a published row world-readable. RLS
-- filters ROWS, not COLUMNS, so `author_email` (stamped by the publish trigger)
-- was readable by anyone holding the publishable key — which ships in the
-- public JS bundle. Verified on 2026-10-19: every published project returned a
-- real address to an unauthenticated request.
--
-- FIX: never stamp the address again, and clear the ones already stored. The
-- column is KEPT (always NULL) so `select('*')` and the generated types keep
-- working; it can be dropped later with:
--     ALTER TABLE public.projects DROP COLUMN author_email;
--
-- NOTHING IS LOST: the trigger only ever copied the address out of auth.users,
-- which is still the source of truth and is not exposed to anon.
--
-- Safe to re-run.

-- 1. The publish trigger stamps only the display name from now on.
CREATE OR REPLACE FUNCTION public.stamp_public_author()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NEW.is_public THEN
    IF NEW.published_at IS NULL THEN NEW.published_at := now(); END IF;
    SELECT coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
      INTO NEW.author_name
    FROM auth.users u WHERE u.id = NEW.user_id;
    NEW.author_email := NULL;   -- never expose the address to community readers
  ELSE
    NEW.published_at := NULL;
    NEW.author_name  := NULL;
    NEW.author_email := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_stamp_author ON public.projects;
CREATE TRIGGER projects_stamp_author
  BEFORE INSERT OR UPDATE OF is_public ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.stamp_public_author();

-- 2. Clear every address already stored (the trigger above keeps them clear).
UPDATE public.projects SET author_email = NULL WHERE author_email IS NOT NULL;

-- 3. Belt and braces: the anon role never needs to write.
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon;
