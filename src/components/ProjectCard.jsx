import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, ArrowUpRight } from "lucide-react";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all cursor-pointer"
      onClick={() => navigate(`/kanban/${project.id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
          {project.name}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(project)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 min-h-[40px]">
        {project.description || "No description provided."}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono uppercase tracking-tighter">ID: {project.id.slice(0,8)}</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
          Open Board <ArrowUpRight size={14} />
        </span>
      </div>
    </div>
  );
}