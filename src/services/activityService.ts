import axios from "axios";

const API = "http://localhost:5001/api/activity";

export const createActivity = async (activity: any) => {
  const res = await axios.post(API, activity);
  return res.data;
};

export const getTaskActivity = async (taskId: string) => {
  const res = await axios.get(`${API}/${taskId}`);
  return res.data;
};