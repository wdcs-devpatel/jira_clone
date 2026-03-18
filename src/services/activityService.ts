import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api"}/activity`;

export const createActivity = async (activity: any) => {
  const res = await axios.post(API, activity);
  return res.data;
};

export const getTaskActivity = async (taskId: string) => {
  const res = await axios.get(`${API}/${taskId}`);
  return res.data;
};