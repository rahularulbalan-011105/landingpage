-- Keep a robot's name the same in the dashboard and the 3D editor.
--
-- The two apps keep the name in different places on the same row:
--   • dashboard (this repo)      → projects.title
--   • 3D editor (Imaginarium)    → projects.content->>'name'  (loaded into the header,
--                                   written back on every auto-save)
-- Nothing copied one into the other, so a rename in the editor never reached
-- My robots (and a rename on the dashboard never reached the editor).
--
-- This trigger mirrors whichever side changed into the other, so neither app
-- needs to know about the other's field.

-- The placeholders each app starts with. A placeholder never overwrites a real name.
create or replace function public.is_placeholder_project_name(n text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select n is null or btrim(n) = '' or btrim(n) ~* '^untitled (project|robot)$'
$$;

create or replace function public.sync_project_name()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  new_name text := nullif(btrim(new.content->>'name'), '');
  old_name text;
begin
  if jsonb_typeof(new.content) is distinct from 'object' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A real name already in the snapshot names an untitled row; otherwise the
    -- title (e.g. "Robot (copy)" on a fork) becomes the editor's name.
    if public.is_placeholder_project_name(new.title) and not public.is_placeholder_project_name(new_name) then
      new.title := left(new_name, 200);
    else
      new.content := jsonb_set(new.content, '{name}', to_jsonb(new.title));
    end if;
    return new;
  end if;

  old_name := nullif(btrim(old.content->>'name'), '');

  if not public.is_placeholder_project_name(new_name)
     and (new_name is distinct from old_name or public.is_placeholder_project_name(new.title)) then
    -- Renamed in the editor → show it on the dashboard. Also heals older robots that
    -- were named in the editor before this trigger existed: their next save fixes the title.
    new.title := left(new_name, 200);
  elsif new.title is distinct from old.title or new_name is null
        or (public.is_placeholder_project_name(new_name) and new_name is distinct from new.title) then
    -- Renamed on the dashboard (or the snapshot lost/reset its name) → the
    -- editor picks the title up the next time it opens the project.
    new.content := jsonb_set(new.content, '{name}', to_jsonb(new.title));
  end if;
  return new;
end;
$$;

-- No bulk backfill: existing robots heal themselves the next time they are saved
-- (or renamed) — see the "heals older robots" branch above. Only the trigger is
-- installed, so this runs instantly and changes no existing row.
drop trigger if exists projects_sync_name on public.projects;
create trigger projects_sync_name
  before insert or update of title, content on public.projects
  for each row execute function public.sync_project_name();
