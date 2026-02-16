/* =======================
   Backend Connected Task Service
   Project-based API
======================= */

const BASE_URL = "http://localhost:5000/api/tasks";

type Status = "todo" | "in-progress" | "done";

/* =======================
   GET TASKS BY PROJECT
======================= */
// ✅ Fixed: Now correctly uses projectId as a number parameter
export async function getAllTasks(projectId: number) {
  const res = await fetch(`${BASE_URL}/project/${projectId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

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
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    throw new Error("Failed to create task");
  }

  return res.json();
}

/* =======================
   UPDATE FULL TASK
======================= */
export async function updateTask(
  taskId: string | number,
  updates: any
) {
  const res = await fetch(`${BASE_URL}/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error("Failed to update task");
  }

  return res.json();
}

/* =======================
   UPDATE STATUS ONLY
======================= */
export async function updateTaskStatus(
  taskId: string | number,
  status: Status
) {
  const res = await fetch(`${BASE_URL}/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update status");
  }

  return res.json();
}

/* =======================
   DELETE TASK
======================= */
export async function deleteTask(
  taskId: string | number
) {
  const res = await fetch(`${BASE_URL}/${taskId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete task");
  }

  return res.json();
}