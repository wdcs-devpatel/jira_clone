import { PRIORITIES } from "../utils/constants";

type Priority = "high" | "medium" | "low";

interface Task {
  id: string | number;
  title: string;
  todo?: string; 
  priority: Priority;
  status: string;
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
}

export default function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-slate-100/50 dark:bg-slate-900/40 rounded-3xl p-5 min-h-[500px] border border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {title} <span className="ml-2 opacity-50">({tasks.length})</span>
        </h2>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const p = PRIORITIES[task.priority] || PRIORITIES.medium;
          return (
            <div key={task.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:hover:border-indigo-500/30 cursor-pointer transition-all">
              <div className="mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${p.bg} ${p.color} ${p.darkBg} ${p.darkText}`}>
                  {p.label}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {task.title || task.todo}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/30">
                <span className="text-[10px] font-mono text-slate-400">
                  #{String(task.id).slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}