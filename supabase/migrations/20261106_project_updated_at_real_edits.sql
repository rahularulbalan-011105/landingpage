-- "Edited N ago" on My robots must mean the creator actually changed the robot.
--
-- projects_set_updated_at used to stamp now() on EVERY update, so two things that
-- aren't edits moved the time:
--   • likes      — bump_like_count() updates likes_count on the owner's row;
--   • the editor — it re-saves the snapshot when its tab is hidden/closed, and the
--                  snapshot always carries fresh `created`/`modified` timestamps,
--                  so merely opening a robot (or alt-tabbing away from an open
--                  editor) counted as an edit.
--
-- Now updated_at moves only when the creator writes AND something real changed:
-- the build (ignoring those two auto-stamped fields), title, description or status.
-- Clients still can't set updated_at themselves — this trigger always decides it.

create or replace function public.set_project_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_build jsonb := case when jsonb_typeof(old.content) = 'object'
                          then old.content - 'created' - 'modified' else old.content end;
  new_build jsonb := case when jsonb_typeof(new.content) = 'object'
                          then new.content - 'created' - 'modified' else new.content end;
begin
  if auth.uid() is distinct from old.user_id                       -- not the creator (likes, admin, SQL editor)
     or (    new_build         is not distinct from old_build
         and new.title         is not distinct from old.title
         and new.description   is not distinct from old.description
         and new.status        is not distinct from old.status) then  -- nothing real changed
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_project_updated_at();
