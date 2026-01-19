import { API_BASE } from "../utils/constants";

/* =======================
   Types
======================= */

export type Status = "todo" | "in-progress" | "done";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  projectId?: string;
  assigneeId?: number;
}

/* =======================
   Local Storage Helpers
======================= */

function getTaskKey(token: string | null) {
  return token ? `jira_tasks_${token}` : null;
}

function safeGet(token: string | null): Task[] {
  try {
    const key = getTaskKey(token);
    if (!key) return [];
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeSet(data: Task[], token: string | null) {
  try {
    const key = getTaskKey(token);
    if (key) localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/* =======================
   CRUD Functions
======================= */

export async function getAllTasks(token: string | null): Promise<Task[]> {
  const cached = safeGet(token);
  if (cached.length > 0) return cached;

  const res = await fetch(`${API_BASE}/todos?limit=30`);
  const data = await res.json();

  const priorityKeys: Priority[] = ["high", "medium", "low"];

  const tasks: Task[] = data.todos.map((t: any, index: number) => ({
    id: String(t.id),
    title: t.todo,
    status: t.completed ? "done" : "todo",
    priority: priorityKeys[Math.floor(Math.random() * priorityKeys.length)],
    assigneeId: (index % 10) + 1,
  }));

  safeSet(tasks, token);
  return tasks;
}

export async function addTask(task: Task, token: string | null) {
  const tasks = safeGet(token);

  const newTask: Task = {
    ...task,
    id: `TASK-${Date.now()}`,
  };

  const updated = [...tasks, newTask];
  safeSet(updated, token);
  return newTask;
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
  token: string | null
) {
  const tasks = safeGet(token);
  const updated = tasks.map((t) =>
    String(t.id) === String(taskId) ? { ...t, ...updates } : t
  );
  safeSet(updated, token);
  return updated;
}

export function updateTaskStatus(
  taskId: string,
  status: Status,
  token: string | null
) {
  return updateTask(taskId, { status }, token);
}

export async function deleteTask(taskId: string, token: string | null) {
  const tasks = safeGet(token);
  const updated = tasks.filter((t) => String(t.id) !== String(taskId));
  safeSet(updated, token);
  return updated;
}

/* =======================
   Comments (FIXED EXPORT)
======================= */

export async function getTaskComments(taskId: string) {
  // Locally created tasks do not have API comments
  if (String(taskId).startsWith("TASK-")) return [];

  try {
    const res = await fetch(`${API_BASE}/comments/post/${taskId}`);
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}
