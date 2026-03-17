import axios from "axios";

const API = `${import.meta.env.VITE_MONGO_API || "http://localhost:5002/api"}/timelog`;

/* CREATE TIME LOG */

export const createTimeLog = async (data: any) => {
  const res = await axios.post(API, data);
  return res.data;
};


/* GET TIME LOGS */

export const getTimeLogs = async (taskId: string) => {
  const res = await axios.get(`${API}/${taskId}`);
  return res.data;
};  