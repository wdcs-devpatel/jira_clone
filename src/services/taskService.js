export const API_BASE = "https://dummyjson.com";

function getTaskKey(token) {
  return token ? `jira_tasks_${token}` : null;
}

function safeGet(token) {
  try {
    const key = getTaskKey(token);
    if (!key) return [];
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeSet(data, token) {
  try {
    const key = getTaskKey(token);
    if (key) localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export async function getAllTasks(token) {
  const cached = safeGet(token);
  if (cached.length > 0) return cached;

  const res = await fetch(`${API_BASE}/todos?limit=30`);
  const data = await res.json();

  const tasks = data.todos.map((t) => ({
    id: t.id,
    title: t.todo,
    userId: t.userId,
    status: t.completed ? "done" : "todo"
  }));

  safeSet(tasks, token);
  return tasks;
}

export async function addTask(task, token) {
  const tasks = safeGet(token);
  const newTask = {
    id: Date.now(),
    title: task.title,
    status: task.status || "todo",
    projectId: task.projectId,
    userId: task.userId || 1
  };
  const updated = [...tasks, newTask];
  safeSet(updated, token);
  return newTask;
}

export async function updateTask(taskId, updates, token) {
  const tasks = safeGet(token);
  const updated = tasks.map((t) =>
    String(t.id) === String(taskId) ? { ...t, ...updates } : t
  );
  safeSet(updated, token);
  return updated;
}

export function updateTaskStatus(taskId, status, token) {
  const tasks = safeGet(token);
  const updated = tasks.map((t) =>
    String(t.id) === String(taskId) ? { ...t, status } : t
  );
  safeSet(updated, token);
  return updated;
}

export async function deleteTask(taskId, token) {
  const tasks = safeGet(token);
  const updated = tasks.filter((t) => String(t.id) !== String(taskId));
  safeSet(updated, token);
  return updated;
}

export async function getTaskComments(taskId) {
  if (Number(taskId) > 10000) return [];
  try {
    const res = await fetch(`${API_BASE}/comments/post/${taskId}`);
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}