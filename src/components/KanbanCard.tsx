import {
  Pencil,
  Trash2,
  User as UserIcon,
  CheckSquare,
  MessageSquare,
  ShieldCheck
} from "lucide-react";

import { PRIORITIES } from "../utils/constants";
import { Task, TaskId } from "../interfaces/task/task.interface";
import { useAuth } from "../context/AuthContext";

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: TaskId) => void;
  onDragStart: (e: React.DragEvent, taskId: TaskId) => void;
  assignee?: { name: string; avatar?: string }; 
  leader?: { name: string; avatar?: string };
}

export default function KanbanCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  assignee,
  leader
}: KanbanCardProps) {
  const { permissions } = useAuth();

  const canEditTask = permissions.includes("edit_task");
  const canDeleteTask = permissions.includes("delete_task");
  const canDrag = permissions.includes("edit_task");

  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  const completedSubtasks =
    task.subtasks?.filter((s: any) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const isComplete =
    totalSubtasks > 0 && completedSubtasks === totalSubtasks;

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        onDragStart(e, task.id);
      }}
      onClick={() => {
        if (canEditTask) {
          onEdit(task);
        }
      }}

      className={`bg-white dark:bg-slate-900 p-3 mb-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative ${
        canDrag
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default opacity-95"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-1.5">
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${p.bg} ${p.color}`}
          >
            {p.label}
          </span>

          {leader && (
            <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1">
              <ShieldCheck size={10} />
            </span>
          )}
        </div>

        {/* ✅ Logic: Show action buttons only if user has specific permissions */}
        {(canEditTask || canDeleteTask) && (
          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            {canEditTask && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                <Pencil size={12} />
              </button>
            )}

            {canDeleteTask && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ Tightened typography for a smaller footprint */}
      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 mb-2 uppercase leading-snug line-clamp-2">
        {task.title}
      </p>

      <div className="flex gap-3 mb-2">
        {totalSubtasks > 0 && (
          <div
            className={`flex items-center gap-1 text-[9px] font-bold ${
              isComplete ? "text-emerald-500" : "text-slate-500"
            }`}
          >
            <CheckSquare size={10} />
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
        )}

        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
            <MessageSquare size={10} />
            {task.comments.length}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800/50">
        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-600 tracking-tighter">
          #{String(task.id).slice(-4).toUpperCase()}
        </span>

        {/* ✅ Assignee display logic */}
        <div className="flex -space-x-1.5">
          {assignee ? (
            <div
              className="w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center text-[7px] text-white font-black uppercase overflow-hidden"
              title={`Assignee: ${assignee.name}`}
            >
              {assignee.avatar ? (
                <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
              ) : (
                assignee.name.charAt(0)
              )}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-white dark:border-slate-900">
              <UserIcon size={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}