export type Priority = "high" | "medium" | "low";

export interface Project {
  id?: string; 
  name: string;
  description?: string;
  priority: Priority;
}

interface Task {
  id: string;
  projectId?: string;
  [key: string]: any;
}

const DEFAULT_PROJECTS: Project[] = [
  { id: "alpha", name: "Project Alpha", description: "Main product work", priority: "high" },
  { id: "beta", name: "Project Beta", description: "Internal improvements", priority: "low" },
  { id: "gamma", name: "Project Gamma", description: "Experimental features", priority: "medium" },
];

export function getProjects(token: string | null): Project[] {
  if (!token) return DEFAULT_PROJECTS;
  try {
    const key = `projects_${token}`;
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return [...DEFAULT_PROJECTS, ...(Array.isArray(stored) ? stored : [])];
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function addProject(project: Project, token: string | null) {
  if (!token) return;
  const key = `projects_${token}`;
  const stored = JSON.parse(localStorage.getItem(key) || "[]");
  const newProject: Project = {
    ...project,
    id: `proj-${Date.now()}`,
    priority: project.priority || "medium",
  };
  localStorage.setItem(key, JSON.stringify([...stored, newProject]));
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>, token: string | null) {
  if (!token) return;
  const key = `projects_${token}`;
  const stored = JSON.parse(localStorage.getItem(key) || "[]");
  const updated = stored.map((p: Project) => p.id === id ? { ...p, ...updates } : p);
  localStorage.setItem(key, JSON.stringify(updated));
}

export function deleteProject(id: string, token: string | null) {
  if (["alpha", "beta", "gamma"].includes(id) || !token) return;
  const key = `projects_${token}`;
  const stored = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(key, JSON.stringify(stored.filter((p: Project) => p.id !== id)));
}

export function enrichTasksWithProject(tasks: Task[] = [], token: string | null): Task[] {
  const mapKey = token ? `taskProjects_${token}` : null;
  if (!mapKey) return tasks;
  let storedMap: Record<string, string> = {};
  try { storedMap = JSON.parse(localStorage.getItem(mapKey) || "{}"); } catch {}
  const projects = getProjects(token);
  const enriched = tasks.map((task) => {
    const taskId = String(task.id);
    if (task.projectId) {
      storedMap[taskId] = String(task.projectId);
      return { ...task, projectId: String(task.projectId) };
    }
    if (storedMap[taskId]) return { ...task, projectId: storedMap[taskId] };
    let hash = 0;
    for (let i = 0; i < taskId.length; i++) hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
    const projectIndex = Math.abs(hash) % projects.length;
    const assignedId = String(projects[projectIndex]?.id || projects[0].id);
    storedMap[taskId] = assignedId;
    return { ...task, projectId: assignedId };
  });
  localStorage.setItem(mapKey, JSON.stringify(storedMap));
  return enriched;
}