import { api } from "./authService";

const BASE_URL = "/tasks";

type Status = "todo" | "in-progress" | "done";

/* SEARCH TASKS */
export async function searchTasks(query: string) {
  const res = await api.get(`${BASE_URL}/search`, {
    params: { q: query }
  });
  return res.data;
}

/* GET TASKS FOR A PROJECT */
export async function getAllTasks(projectId: number) {
  const res = await api.get(`${BASE_URL}/project/${projectId}`);
  return res.data;
}

/* CREATE TASK */
export async function addTask(task: any, projectId: number) {
  const res = await api.post(`${BASE_URL}/project/${projectId}`, task);
  return res.data;
}

/* UPDATE TASK */
export async function updateTask(taskId: string | number, updates: any) {
  const res = await api.put(`${BASE_URL}/${taskId}`, updates);
  return res.data;
}

/* UPDATE STATUS (Drag and Drop) */
export async function updateTaskStatus(taskId: string | number, status: Status) {
  const res = await api.patch(`${BASE_URL}/${taskId}/status`, { status });
  return res.data;
}

/* DELETE TASK */
export async function deleteTask(taskId: string | number) {
  const res = await api.delete(`${BASE_URL}/${taskId}`);
  return res.data;
}