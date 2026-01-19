  export default function ProjectProgress({ tasks }) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="mt-3">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {percent}% completed
          </p>
          <p className="text-xs text-slate-400">
            {completed}/{total} tasks
          </p>
        </div>
      </div>
    );
  }