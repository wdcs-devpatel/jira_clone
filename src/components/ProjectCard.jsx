import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, ArrowUpRight, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { PRIORITIES } from "../utils/constants";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const p = PRIORITIES[project.priority] || PRIORITIES.medium;

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/kanban/${project.id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
          {project.name}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(project)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
        {project.description}
      </p>
      <div className="mt-auto flex">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border shadow-sm ${p.bg} ${p.color} ${p.darkBg} ${p.darkText} border-current/20`}>
          {project.priority === 'high' && <AlertCircle size={12} />}
          {project.priority === 'medium' && <Clock size={12} />}
          {project.priority === 'low' && <CheckCircle2 size={12} />}
          {p.label} Priority
        </div>
      </div>
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono">ID: {project.id.slice(0, 8)}</span>
        <span className="text-indigo-600 font-medium flex items-center gap-1 font-sans">
          Open Board <ArrowUpRight size={14} />
        </span>
      </div>
    </div>
  );
}