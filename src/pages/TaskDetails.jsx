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
      } catch (e) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [task.id]);

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">
        {task.todo}
      </h2>

      <div className="flex gap-3 mb-4 text-sm">
        <span
          className={`px-3 py-1 rounded-full ${
            task.completed ? "bg-green-600" : "bg-yellow-600"
          }`}
        >
          {task.completed ? "Completed" : "Pending"}
        </span>

        <span className="bg-gray-700 px-3 py-1 rounded-full">
          User #{task.userId}
        </span>
      </div>

      <h3 className="text-lg font-medium mb-2">Comments</h3>

      {loading && (
        <p className="text-gray-400 text-sm">Loading comments…</p>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-gray-400 text-sm">No comments found.</p>
      )}

      <div className="space-y-3 max-h-56 overflow-y-auto">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-gray-700 p-3 rounded text-sm"
          >
            <p>{c.body}</p>
            <p className="text-xs text-gray-400 mt-1">
              — {c.user.username}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
