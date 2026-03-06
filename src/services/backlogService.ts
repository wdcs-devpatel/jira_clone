import axios from "axios";

// Accessing the environment variable for the Mongo API
const MONGO_API = import.meta.env.VITE_MONGO_API;

export interface Backlog {
  _id: string;
  title: string;
  projectId: number;
  createdBy: number;
  priority: "critical" | "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
}

/* =============================
   GET BACKLOGS
============================= */
export async function getBacklogs(projectId?: number) {
  const res = await axios.get(`${MONGO_API}/backlogs`, {
    params: { projectId }
  });

  return res.data;
}

/* =============================
   CREATE BACKLOG
============================= */
export async function createBacklog(data: Partial<Backlog>) {
  const res = await axios.post(`${MONGO_API}/backlogs`, data);
  return res.data;
}

/* =============================
   UPDATE BACKLOG
============================= */
export async function updateBacklog(id: string, data: Partial<Backlog>) {
  const res = await axios.put(`${MONGO_API}/backlogs/${id}`, data);
  return res.data;
}

/* =============================
   DELETE BACKLOG
============================= */
export async function deleteBacklog(id: string) {
  const res = await axios.delete(`${MONGO_API}/backlogs/${id}`);
  return res.data;
}