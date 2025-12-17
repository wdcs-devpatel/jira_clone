import { useEffect, useState } from "react";
import { getTaskComments } from "../services/taskService";

export default function TaskDetails({ task }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      try {
        const data = await getTaskComments(task.id);
        setComments(data);
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [task.id]);

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold mb-3">
        {task.title}
      </h2>

      <div className="flex flex-wrap gap-2 mb-5 text-xs">
        <span
          className={`px-3 py-1 rounded-full ${
            task.status === "done"
              ? "bg-green-600/80"
              : "bg-yellow-600/80"
          }`}
        >
          {task.status === "done" ? "Completed" : "Pending"}
        </span>

        <span className="bg-slate-700 px-3 py-1 rounded-full">
          Project: {task.projectId}
        </span>
      </div>

      <h3 className="text-sm font-semibold mb-2 text-slate-300">
        Comments
      </h3>

      {loading && (
        <p className="text-slate-400 text-sm">Loading comments…</p>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-slate-400 text-sm">
          No comments available
        </p>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm"
          >
            <p className="text-slate-200">{c.body}</p>
            <p className="text-xs text-slate-400 mt-2">
              — {c.user.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
