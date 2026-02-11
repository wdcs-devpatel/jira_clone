/* =======================
   Types
======================= */

export type ProjectId = "alpha" | "beta" | "gamma";

export interface Project {
  id: ProjectId;
  name: string;
}

export interface Task {
  id: string | number;
  [key: string]: any;
}

/* =======================
   Projects
======================= */

export const PROJECTS: Project[] = [
  { id: "alpha", name: "Project Alpha" },
  { id: "beta", name: "Project Beta" },
  { id: "gamma", name: "Project Gamma" },
];



function normalizeTaskId(id: string | number): number {
  if (typeof id === "number") return id;

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function assignProject(taskId: string | number): ProjectId {
  const normalized = normalizeTaskId(taskId);
  const mod = normalized % PROJECTS.length;

  return PROJECTS[mod].id;
}

export function enrichTasksWithProject<T extends Task>(
  tasks: T[]
): (T & { projectId: ProjectId })[] {
  let stored: Record<string, ProjectId> = {};

  try {
    const raw = localStorage.getItem("taskProjects");
    stored = raw ? JSON.parse(raw) : {};
  } catch {
    stored = {};
  }

  const updated = tasks.map((task) => {
    const key = String(task.id);

    if (!stored[key]) {
      stored[key] = assignProject(task.id);
    }

    return {
      ...task,
      projectId: stored[key],
    };
  });

  localStorage.setItem("taskProjects", JSON.stringify(stored));
  return updated;
}
