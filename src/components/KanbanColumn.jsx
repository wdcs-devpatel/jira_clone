export default function KanbanColumn({ title, tasks }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 min-h-[300px]">
      <h2 className="text-lg font-semibold mb-4">
        {title} <span className="text-sm text-gray-400">({tasks.length})</span>
      </h2>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600"
          >
              {task.todo}
          </div>
        ))}
      </div>
    </div>
  );
} 