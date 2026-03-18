import { api } from "./authService"; // ✅ Uses the Postgres Axios instance

const BASE_URL = "/tasks";

/* =============================================================
   TYPES
============================================================= */
/**
 * ✅ FIXED: Updated Status type to match the new Kanban workflow:
 * To Do -> In Progress -> QA -> Done
 */
export type Status = "To Do" | "In Progress" | "QA" | "Done";

/* =============================================================
   FETCHING LOGIC
============================================================= */

/**
 * GET ALL TASKS
 * Routes to: /api/tasks/project/:projectId
 * * ✅ NEW: Added logic to handle JSON-as-string behavior. 
 * This maps through the fetched tasks and ensures 'subtasks' and 'comments' 
 * are converted from strings back into JSON arrays so the UI can render them.
 */
export async function getAllTasks(projectId?: string | number) {
  const url = projectId ? `${BASE_URL}/project/${projectId}` : BASE_URL;
  const res = await api.get(url);

  const tasks = res.data.map((task: any) => ({
    ...task,
    subtasks:
      typeof task.subtasks === "string"
        ? JSON.parse(task.subtasks || "[]")
        : task.subtasks || [],
    comments:
      typeof task.comments === "string"
        ? JSON.parse(task.comments || "[]")
        : task.comments || [],
  }));

  return tasks;
}

/**
 * GET SINGLE TASK BY ID
 * Routes to: /api/tasks/:id
 * * ✅ NEW: Similar to getAllTasks, this ensures that the individual task 
 * loaded into the Task Configuration page has 'subtasks' and 'comments' 
 * pre-parsed into arrays, preventing "map is not a function" errors in the UI.
 */
export async function getTaskById(taskId: string | number) {
  const res = await api.get(`${BASE_URL}/${taskId}`);
  const task = res.data;

  return {
    ...task,
    subtasks:
      typeof task.subtasks === "string"
        ? JSON.parse(task.subtasks || "[]")
        : task.subtasks || [],
    comments:
      typeof task.comments === "string"
        ? JSON.parse(task.comments || "[]")
        : task.comments || [],
  };
}

/* =============================================================
   ACTION LOGIC
============================================================= */

/**
 * CREATE TASK
 * Routes to: POST /api/tasks/project/:projectId
 */
export async function addTask(task: any, projectId: string | number) {
  const res = await api.post(`${BASE_URL}/project/${projectId}`, task);
  return res.data;
}

/**
 * UPDATE TASK STATUS
 * Routes to: PATCH /api/tasks/:id/status
 */
export async function updateTaskStatus(taskId: string | number, status: Status) {
  const res = await api.patch(`${BASE_URL}/${taskId}/status`, { status });
  return res.data;
}

/**
 * UPDATE TASK
 * Routes to: PUT /api/tasks/:id
 * This sends the full payload including stringified subtasks/comments back to the server.
 */
export async function updateTask(taskId: string | number, updates: any) {
  const res = await api.put(`${BASE_URL}/${taskId}`, updates);
  return res.data;
}

/**
 * DELETE TASK
 * Routes to: DELETE /api/tasks/:id
 */
export async function deleteTask(taskId: string | number) {
  const res = await api.delete(`${BASE_URL}/${taskId}`);
  return res.data;
}

/**
 * SEARCH TASKS
 * Queries the backend for matching task titles.
 */
export async function searchTasks(query: string) {
  const res = await api.get(`${BASE_URL}/search`, { params: { q: query } });
  return res.data;
}