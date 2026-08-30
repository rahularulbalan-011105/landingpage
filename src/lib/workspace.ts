import { supabase } from "@/integrations/supabase/client";

/** Origin of the Constructa 3D editor (the actual project workspace). */
export const EDITOR_ORIGIN =
  (import.meta.env.VITE_EDITOR_ORIGIN as string | undefined) || "https://constructa.atumx.in";

/**
 * Build the URL that opens the editor on a specific project.
 *
 * The user's session is handed off in the URL *fragment* (`#cs=…`): fragments are
 * never sent to any server, and the editor consumes + strips it immediately on
 * arrival (see CloudProjectManager). This is what lets one Supabase session span
 * the two subdomains without a shared cookie.
 */
export async function buildWorkspaceUrl(
  projectId: string,
  opts?: { readOnly?: boolean },
): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const s = data.session;

  const params = new URLSearchParams({ app: "1", project: projectId });
  if (opts?.readOnly) params.set("ro", "1");
  let url = `${EDITOR_ORIGIN}/?${params.toString()}`;

  if (s?.access_token && s?.refresh_token) {
    const payload = btoa(JSON.stringify({ at: s.access_token, rt: s.refresh_token }));
    url += `#cs=${encodeURIComponent(payload)}`;
  }
  return url;
}

/** Navigate the current tab into the editor for a project. */
export async function openWorkspace(projectId: string, opts?: { readOnly?: boolean }): Promise<void> {
  const url = await buildWorkspaceUrl(projectId, opts);
  window.location.href = url;
}
