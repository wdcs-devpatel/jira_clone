// src/interfaces/task/task.interface.ts

export type TaskId = string | number;
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: TaskId;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  name?: string;
  description?: string;
  projectId?: string;
  assigneeId?: number;
  [key: string]: any;
}
