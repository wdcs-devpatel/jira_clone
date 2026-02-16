import { Pencil, Trash2, User as UserIcon, CheckSquare, MessageSquare, ShieldCheck } from "lucide-react";
import { PRIORITIES } from "../utils/constants";
import { Task, TaskId } from "../interfaces/task/task.interface";

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: TaskId) => void;
  onDragStart: (e: React.DragEvent, taskId: TaskId) => void;
  assignee?: { name: string; avatar?: string };
  leader?: { name: string; avatar?: string };
}

export default function KanbanCard({ task, onEdit, onDelete, onDragStart, assignee, leader }: KanbanCardProps) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const isComplete = totalSubtasks > 0 && completedSubtasks === totalSubtasks;

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)} 
      onClick={() => onEdit(task)}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:border-indigo-500/50 transition-all group relative cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${p.bg} ${p.color} ${p.darkBg} ${p.darkText}`}>
            {p.label}
          </span>
          {leader && (
            <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
              <ShieldCheck size={10} /> Lead
            </span>
          )}
        </div>

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

      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-tight line-clamp-2">
        {task.title}
      </p>

      <div className="flex gap-4 mb-4">
        {totalSubtasks > 0 && (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isComplete ? "text-emerald-500" : "text-slate-500"}`}>
            <CheckSquare size={12} />
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
        )}
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
            <MessageSquare size={12} />
            {task.comments.length}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
          #{String(task.id).slice(-4).toUpperCase()}
        </span>
        
        <div className="flex -space-x-2">
          {assignee ? (
            <div 
              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold uppercase overflow-hidden" 
              title={`Assignee: ${assignee.name}`}
            >
              {assignee.avatar ? <img src={assignee.avatar} alt={assignee.name} /> : assignee.name.charAt(0)}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 border-2 border-white dark:border-slate-900">
              <UserIcon size={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}