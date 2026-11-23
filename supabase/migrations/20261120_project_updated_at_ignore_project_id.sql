-- "Edited N ago" — also ignore the snapshot's `projectId`.
--
-- Robots created on the dashboard store no `projectId` in `content`, and older
-- editor builds minted a fresh random one on every open. Merely opening such a
-- robot therefore changed `content` and moved updated_at. The editor now reuses
-- the row id, but `projectId` is editor bookkeeping, not part of the build, so the
-- trigger ignores it alongside the auto-stamped `created`/`modified` fields.
--
-- Same rules as 20261106_project_updated_at_real_edits.sql otherwise: updated_at
-- moves only when the creator writes AND the build, title, description or status
-- really changed. The trigger itself is unchanged; only its function is replaced.

create or replace function public.set_project_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_build jsonb := case when jsonb_typeof(old.content) = 'object'
                          then old.content - 'created' - 'modified' - 'projectId' else old.content end;
  new_build jsonb := case when jsonb_typeof(new.content) = 'object'
                          then new.content - 'created' - 'modified' - 'projectId' else new.content end;
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
