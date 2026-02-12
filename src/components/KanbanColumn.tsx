import { Plus } from "lucide-react";
import KanbanCard from "./KanbanCard";
import { Task, TaskId } from "../interfaces/task/task.interface";

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  users: any[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: TaskId) => void;
  onAddClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: TaskId) => void; 
}

export default function KanbanColumn({ 
  title, 
  status, 
  tasks, 
  users, 
  onEdit, 
  onDelete, 
  onAddClick,
  onDragStart 
}: KanbanColumnProps) {
  return (

    <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] p-6 min-h-[650px] border border-slate-200 dark:border-slate-800/40 transition-all shadow-inner">
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {title} 
          <span className="ml-2 opacity-50">({tasks.length})</span>
        </h2>
        <button
          onClick={onAddClick}
          className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart} 
            assignee={users.find((u) => u.id === Number(task.assigneeId))}
            leader={users.find((u) => u.id === Number(task.leaderId))}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-800/20 rounded-2xl flex items-center justify-center">
            <p className="text-[10px] font-bold uppercase text-slate-300 dark:text-slate-700 tracking-widest">No Tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}