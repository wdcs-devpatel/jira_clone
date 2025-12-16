export default function ProjectProgress({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="w-full bg-gray-700 rounded h-2">
        <div
          className="bg-green-500 h-2 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {percent}% completed
      </p>
    </div>
  );
}

    