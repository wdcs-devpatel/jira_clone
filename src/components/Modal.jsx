export default function TaskModal({ task, onClose, comments }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

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

        <div className="space-y-3 max-h-48 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-gray-400 text-sm">No comments available.</p>
          )}

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
      </div>
    </div>
  );
}
