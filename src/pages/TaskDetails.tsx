import { useEffect, useState } from "react";
import { PRIORITIES } from "../utils/constants";

/* =======================
   Types
======================= */

type Status = "todo" | "in-progress" | "done";
type Priority = "high" | "medium" | "low";

interface Comment {
  id?: number;
  text?: string;
  author?: string;
}

interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  projectId: string;
  comments?: Comment[]; // ✅ now coming from DB JSON column
}

/* =======================
   Component
======================= */

export default function TaskDetails({ task }: { task: Task }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  useEffect(() => {
    // ✅ Instead of API call, read from task directly
    if (task.comments && Array.isArray(task.comments)) {
      setComments(task.comments);
    } else {
      setComments([]);
    }

    setLoading(false);
  }, [task]);

  return (
    <div className="text-slate-900 dark:text-white">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${p.bg} ${p.color} ${p.darkBg} ${p.darkText}`}
        >
          {p.label} Priority
        </span>
      </div>

      <h2 className="text-xl font-semibold mb-3">{task.title}</h2>

      <div className="flex gap-2 mb-6">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            task.status === "done"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {task.status === "done" ? "Completed" : "In Progress"}
        </span>

        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-mono">
          Project: {task.projectId}
        </span>
      </div>

      <h3 className="text-sm font-bold mb-3 text-slate-400 uppercase tracking-wider">
        Comments
      </h3>

      {loading && (
        <p className="text-slate-400 text-sm">Loading comments…</p>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-slate-400 text-sm">No comments found.</p>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm"
            >
              <div className="font-semibold text-xs mb-1">
                {comment.author || "User"}
              </div>
              <div>{comment.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
