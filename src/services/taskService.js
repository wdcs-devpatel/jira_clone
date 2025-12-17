const STORAGE_KEY = "jira_tasks";

function safeGet() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeSet(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export async function getAllTasks() {
  const cached = safeGet();
  if (cached.length > 0) return cached;

  const res = await fetch("https://dummyjson.com/todos?limit=30");
  const data = await res.json();

  const tasks = data.todos.map((t) => ({
    id: t.id,
    title: t.todo,
    userId: t.userId,
    status: t.completed ? "done" : "todo"
  }));

  safeSet(tasks);
  return tasks;
}

export async function addTask(task) {
  const tasks = safeGet();

  const newTask = {
    id: Date.now(),
    title: task.title,
    status: task.status || "todo",
    projectId: task.projectId,
    userId: task.userId || 1
  };

  const updated = [...tasks, newTask];
  safeSet(updated);
  return newTask;
}

export async function updateTask(taskId, updates) {
  const tasks = safeGet();

  const updated = tasks.map((t) =>
    String(t.id) === String(taskId) ? { ...t, ...updates } : t
  );

  safeSet(updated);
  return updated;
}

export function updateTaskStatus(taskId, status) {
  const tasks = safeGet();

  const updated = tasks.map((t) =>
    String(t.id) === String(taskId) ? { ...t, status } : t
  );

  safeSet(updated);
  return updated;
}

export async function deleteTask(taskId) {
  const tasks = safeGet();

  const updated = tasks.filter(
    (t) => String(t.id) !== String(taskId)
  );

  safeSet(updated);
  return updated;
}

export async function getTaskComments(taskId) {
  if (Number(taskId) > 10000) return [];

  try {
    const res = await fetch(
      `https://dummyjson.com/comments/post/${taskId}`
    );
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}
