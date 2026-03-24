import { api } from "./authService";

export const createActivity = async (activity: any) => {
  const res = await api.post("/activity", activity);
  return res.data;
};

export const getTaskActivity = async (taskId: string) => {
  const res = await api.get(`/activity/${taskId}`);
  return res.data;
};