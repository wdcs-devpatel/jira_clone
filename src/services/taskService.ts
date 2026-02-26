import { api } from "./authService";

const BASE_URL = "/tasks";

type Status = "todo" | "in-progress" | "done";

/* =============================================================
   SEARCH TASKS
   Matches: router.get("/search", searchTasks)
   ============================================================= */
export async function searchTasks(query: string) {
  const res = await api.get(`${BASE_URL}/search`, {
    params: { q: query }
  });
  return res.data;
}

/* =============================================================
   GET TASKS FOR A PROJECT
   Matches: router.get("/project/:projectId", getTasksForProject)
   ============================================================= */
export async function getAllTasks(projectId: number) {
  // Ensure we send a valid numeric projectId to avoid 400 errors
  const res = await api.get(`${BASE_URL}/project/${projectId}`);
  return res.data;
}

/* =============================================================
   CREATE TASK
   Matches: router.post("/project/:projectId", requirePermission("create_task"), createTask)
   ============================================================= */
export async function addTask(task: any, projectId: number) {
  const res = await api.post(`${BASE_URL}/project/${projectId}`, task);
  return res.data;
}

/* =============================================================
   UPDATE TASK (Includes Comments and Subtasks)
   Matches: router.put("/:id", requirePermission("edit_task"), updateTask)
   ============================================================= */
export async function updateTask(taskId: string | number, updates: any) {
  // ✅ FIX: This sends the updates object (including the comments array) 
  // to the backend where task.update(req.body) saves it to the JSON column.
  const res = await api.put(`${BASE_URL}/${taskId}`, updates);
  return res.data;
}

/* =============================================================
   UPDATE STATUS (Drag and Drop)
   Matches: router.patch("/:id/status", updateTaskStatus)
   ============================================================= */
export async function updateTaskStatus(taskId: string | number, status: Status) {
  const res = await api.patch(`${BASE_URL}/${taskId}/status`, { status });
  return res.data;
}

/* =============================================================
   DELETE TASK
   Matches: router.delete("/:id", requirePermission("delete_task"), deleteTask)
   ============================================================= */
export async function deleteTask(taskId: string | number) {
  const res = await api.delete(`${BASE_URL}/${taskId}`);
  return res.data;
}