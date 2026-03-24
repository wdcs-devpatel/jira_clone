import { api } from "./authService";

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
  const res = await api.get("/backlogs", {
    params: { projectId }
  });

  return res.data;
}

/* =============================
   CREATE BACKLOG
============================= */
export async function createBacklog(data: Partial<Backlog>) {
  const res = await api.post("/backlogs", data);
  return res.data;
}

/* =============================
   UPDATE BACKLOG
============================= */
export async function updateBacklog(id: string, data: Partial<Backlog>) {
  const res = await api.put(`/backlogs/${id}`, data);
  return res.data;
}

/* =============================
   DELETE BACKLOG
============================= */
export async function deleteBacklog(id: string) {
  const res = await api.delete(`/backlogs/${id}`);
  return res.data;
}