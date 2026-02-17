const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/tasks`;

type Status = "todo" | "in-progress" | "done";

/**
 * FIXED: Explicitly typed to HeadersInit to resolve TypeScript errors.
 * Returns undefined if no token is found so fetch can handle it safely.
 */
function authHeader(): HeadersInit | undefined {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/* =======================
   GET TASKS BY PROJECT
======================= */
export async function getAllTasks(projectId: number) {
  const res = await fetch(`${BASE_URL}/project/${projectId}`, {
    headers: authHeader() || {}
  });

  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

/* =======================
   CREATE TASK IN PROJECT
======================= */
export async function addTask(task: any, projectId: number) {
  const res = await fetch(`${BASE_URL}/project/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader() || {})
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

/* =======================
   UPDATE FULL TASK
======================= */
export async function updateTask(taskId: string | number, updates: any) {
  const res = await fetch(`${BASE_URL}/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader() || {})
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

/* =======================
   UPDATE STATUS ONLY
======================= */
export async function updateTaskStatus(taskId: string | number, status: Status) {
  const res = await fetch(`${BASE_URL}/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader() || {})
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

/* =======================
   DELETE TASK
======================= */
export async function deleteTask(taskId: string | number) {
  const res = await fetch(`${BASE_URL}/${taskId}`, {
    method: "DELETE",
    headers: authHeader() || {}
  });

  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}