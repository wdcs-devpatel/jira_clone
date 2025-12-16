const STORAGE_KEY = "jira_tasks";


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


export async function getAllTasks() {
  const cached = safeGet();
  if (cached) return cached;

  const res = await fetch("https://dummyjson.com/todos?limit=30");
  const data = await res.json();

  const tasks = data.todos.map((t) => ({
    id: t.id,
    title: t.todo,
    userId: t.userId,
    status: t.completed ? "done" : "todo",   }));

  safeSet(tasks);
  return tasks;
}

export function updateTaskStatus(taskId, status) {
  const tasks = safeGet() || [];

  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, status } : t
  );

  safeSet(updated);
  return updated;
}


export async function getTaskComments(taskId) {
  const res = await fetch(
    `https://dummyjson.com/comments/post/${taskId}`
  );
  const data = await res.json();
  return data.comments || [];
}
