import { API_BASE } from "../utils/constants";

/* =======================
   Local helpers only
   (NO interfaces here)
======================= */

type Status = "todo" | "in-progress" | "done";
type Priority = "high" | "medium" | "low";

function getTaskKey(token: string | null) {
  return token ? `jira_tasks_${token}` : null;
}

function safeGet(token: string | null): any[] {
  try {
    const key = getTaskKey(token);
    if (!key) return [];
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeSet(data: any[], token: string | null) {
  try {
    const key = getTaskKey(token);
    if (key) localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/* =======================
   Task APIs (LOOSE)
======================= */

export async function getAllTasks(token: string | null) {
  const cached = safeGet(token);
  if (cached.length > 0) return cached;

  const res = await fetch(`${API_BASE}/todos?limit=30`);
  const data = await res.json();

  const priorities: Priority[] = ["high", "medium", "low"];

  const tasks = data.todos.map((t: any, index: number) => ({
    id: String(t.id),
    title: t.todo,
    status: t.completed ? "done" : "todo",
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assigneeId: (index % 10) + 1,
  }));

  safeSet(tasks, token);
  return tasks;
}

export async function addTask(task: any, token: string | null) {
  const tasks = safeGet(token);

  const newTask = {
    ...task,
    id: `TASK-${Date.now()}`,
  };

  const updated = [...tasks, newTask];
  safeSet(updated, token);
  return newTask;
}

export async function updateTask(
  taskId: string | number,
  updates: any,
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
  taskId: string | number,
  status: Status,
  token: string | null
) {
  return updateTask(taskId, { status }, token);
}

export async function deleteTask(taskId: string | number, token: string | null) {
  const tasks = safeGet(token);
  const updated = tasks.filter((t) => String(t.id) !== String(taskId));
  safeSet(updated, token);
  return updated;
}

export async function getTaskComments(taskId: string | number) {
  if (String(taskId).startsWith("TASK-")) return [];

  try {
    const res = await fetch(`${API_BASE}/comments/post/${taskId}`);
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}
