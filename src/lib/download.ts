import type { Project } from "@/lib/projects";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "robot"
  );
}

/** Trigger a browser download of arbitrary JSON. */
export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Download a project as a Constructa `.json` file — the same editor snapshot
 * shape the workshop imports, so a downloaded robot re-opens cleanly.
 */
export function downloadProjectJSON(project: {
  title: string;
  description?: string | null;
  content: unknown;
  status?: string;
  created_at?: string;
  updated_at?: string;
}) {
  const payload = {
    format: "constructa.project",
    exportedAt: new Date().toISOString(),
    title: project.title,
    description: project.description ?? "",
    status: project.status ?? "draft",
    project: project.content ?? {},
  };
  downloadJSON(payload, `${slugify(project.title)}.json`);
}

export { slugify };
