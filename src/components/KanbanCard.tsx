import { Pencil, Trash2, User as UserIcon } from "lucide-react";
import { PRIORITIES, Priority } from "../utils/constants";

interface Task {
  id: string | number;
  title: string;
  priority: Priority;
  assigneeId?: number;
  [key: string]: any;
}

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string | number) => void;
  assignee?: { name: string; avatar: string; };
}

export default function KanbanCard({ task, onEdit, onDelete, assignee }: KanbanCardProps) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:hover:border-indigo-500/30 transition-all group relative">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${p.bg} ${p.color} ${p.darkBg} ${p.darkText}`}>
          {p.label}
        </span>
        
        {/* Action Buttons: Visible on Hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight">
        {task.title}
      </p>

      <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-700/30">
        <span className="text-[10px] font-mono text-slate-400">#{String(task.id).slice(-4)}</span>
        {assignee ? (
          <img src={assignee.avatar} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-800" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
            <UserIcon size={12} />
          </div>
        )}
      </div>
    </div>
  );
}