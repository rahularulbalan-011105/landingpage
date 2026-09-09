import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type ProjectStatus = "draft" | "completed";

/** A fresh, valid (empty) editor snapshot so a brand-new project opens cleanly. */
export const EMPTY_CONTENT = { version: "1.1", objects: [] };

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user.id;
}

/** All of the signed-in user's projects, newest activity first. RLS scopes this to them. */
export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function createProject(
  input: { title?: string; description?: string } = {},
): Promise<Project> {
  const user_id = await currentUserId();
  const row: TablesInsert<"projects"> = {
    user_id,
    title: input.title?.trim() || "Untitled robot",
    description: input.description?.trim() || "",
    content: EMPTY_CONTENT,
    status: "draft",
  };
  const { data, error } = await supabase.from("projects").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, patch: TablesUpdate<"projects">): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function markComplete(id: string): Promise<Project> {
  return updateProject(id, { status: "completed", completed_at: new Date().toISOString() });
}

export async function reopenDraft(id: string): Promise<Project> {
  return updateProject(id, { status: "draft", completed_at: null });
}

// ── Community ────────────────────────────────────────────────────────────────

/** Make one of your projects public (server stamps your name/email + published_at). */
export async function publishToCommunity(id: string): Promise<Project> {
  return updateProject(id, { is_public: true });
}

/** Take a project back out of the community. */
export async function unpublishFromCommunity(id: string): Promise<Project> {
  return updateProject(id, { is_public: false });
}

/** Every published project — most-liked first, then newest. RLS lets anyone read these. */
export async function listCommunity(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_public", true)
    .order("likes_count", { ascending: false })
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** The set of project ids the current user has liked (for the filled-heart state). */
export async function listMyLikes(): Promise<Set<string>> {
  const { data, error } = await supabase.from("project_likes").select("project_id");
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.project_id));
}

export async function likeProject(id: string): Promise<void> {
  const user_id = await currentUserId();
  const { error } = await supabase.from("project_likes").insert({ project_id: id, user_id });
  // 23505 = already liked (unique violation) → treat as success (idempotent).
  if (error && (error as { code?: string }).code !== "23505") throw error;
}

export async function unlikeProject(id: string): Promise<void> {
  const user_id = await currentUserId();
  const { error } = await supabase
    .from("project_likes")
    .delete()
    .eq("project_id", id)
    .eq("user_id", user_id);
  if (error) throw error;
}

/**
 * Fork a community project into the current user's dashboard as a fresh, private
 * draft. The original stays untouched in the community — this is the editable copy.
 */
export async function forkProject(source: Project): Promise<Project> {
  const user_id = await currentUserId();
  const row: TablesInsert<"projects"> = {
    user_id,
    title: `${source.title || "Robot"} (remix)`.slice(0, 200),
    description: source.description ?? "",
    content: source.content,
    status: "draft",
    forked_from: source.id,
  };
  const { data, error } = await supabase.from("projects").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

// ── Sharing ──────────────────────────────────────────────────────────────────

function randomToken(bytes = 18): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  // URL-safe base64 without padding.
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Return an existing share token for a project, or mint a new one. Idempotent-ish. */
export async function getOrCreateShareToken(projectId: string): Promise<string> {
  const { data: existing, error: readErr } = await supabase
    .from("project_shares")
    .select("token")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readErr) throw readErr;
  if (existing?.token) return existing.token;

  const token = randomToken();
  const { data, error } = await supabase
    .from("project_shares")
    .insert({ project_id: projectId, token })
    .select("token")
    .single();
  if (error) throw error;
  return data.token;
}

export async function revokeShares(projectId: string): Promise<void> {
  const { error } = await supabase.from("project_shares").delete().eq("project_id", projectId);
  if (error) throw error;
}

export type SharedProject = {
  id: string;
  title: string;
  description: string;
  content: unknown;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

/** Public, read-only fetch of a shared project (anon-safe SECURITY DEFINER RPC). */
export async function getSharedProject(token: string): Promise<SharedProject | null> {
  const { data, error } = await supabase.rpc("get_shared_project", { share_token: token });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as SharedProject) ?? null;
}
