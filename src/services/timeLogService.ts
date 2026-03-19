import { api } from "./authService"; // ✅ Uses authenticated Axios instance (with Bearer token)

const TIMELOG_API = `/timelog`;

/* CREATE TIME LOG — posts to /api/tasks/:taskId/timelog via Postgres backend */
export const createTimeLog = async (data: any) => {
  const res = await api.post(`/tasks/${data.taskId}/timelog`, data);
  return res.data;
};

/* GET TIME LOGS — fetches from /api/timelog/:taskId via Mongo backend */
export const getTimeLogs = async (taskId: string) => {
  const res = await api.get(`${TIMELOG_API}/${taskId}`);
  return res.data;
};