const STORAGE_KEY = "jira_tasks";

/* =========================
   SAFE STORAGE HELPERS
   ========================= */
function safeGet() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function safeSet(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/* =========================
   FETCH / LOAD TASKS
   ========================= */
export async function getAllTasks() {
  const cached = safeGet();
  if (Array.isArray(cached) && cached.length > 0) return cached;

  const res = await fetch("https://dummyjson.com/todos?limit=30");
  const data = await res.json();

  const tasks = data.todos.map((t) => ({
    id: t.id,
    title: t.todo,
    userId: t.userId,
    status: t.completed ? "done" : "todo",
  }));

  safeSet(tasks);
  return tasks;
}

/* =========================
   ADD TASK
   ========================= */
export async function addTask(task) {
  const tasks = safeGet() || [];

  const newTask = {
    id: Date.now(), // local unique ID
    title: task.title,
    userId: task.userId || null,
    status: task.status || "todo",
  };

  const updated = [...tasks, newTask];
  safeSet(updated);
  return newTask;
}

/* =========================
   UPDATE TASK (TITLE / DATA)
   ========================= */
export async function updateTask(taskId, updates) {
  const tasks = safeGet() || [];

  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, ...updates } : t
  );

  safeSet(updated);
  return updated;
}

/* =========================
   UPDATE TASK STATUS
   ========================= */
export function updateTaskStatus(taskId, status) {
  const tasks = safeGet() || [];

  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, status } : t
  );

  safeSet(updated);
  return updated;
}

/* =========================
   DELETE TASK
   ========================= */
export async function deleteTask(taskId) {
  const tasks = safeGet() || [];

  const updated = tasks.filter((t) => t.id !== taskId);
  safeSet(updated);
  return updated;
}

/* =========================
   COMMENTS (READ-ONLY)
   ========================= */
export async function getTaskComments(taskId) {
  const res = await fetch(
    `https://dummyjson.com/comments/post/${taskId}`
  );
  const data = await res.json();
  return data.comments || [];
}
