import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  ArrowUpRight,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PRIORITIES } from "../utils/constants";

type Priority = "high" | "medium" | "low";

interface Project {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const p = PRIORITIES[project.priority] || PRIORITIES.medium;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <div
      onClick={() => navigate(`/kanban/${project.id}`)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {project.name}
        </h3>
        <div
          className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => onEdit(project)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500">
            <Pencil size={14} />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
        {project.description || "No description provided."}
      </p>

      <div className="mt-auto">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors ${p.bg} ${p.color} ${p.darkBg} ${p.darkText}`}>
          {project.priority === "high" && <AlertCircle size={12} />}
          {project.priority === "medium" && <Clock size={12} />}
          {project.priority === "low" && <CheckCircle2 size={12} />}
          {p.label} Priority
        </div>
      </div>

      <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
        <span className="text-[10px] font-mono text-slate-400">#{project.id.slice(-6).toUpperCase()}</span>
        <span className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          Open Board <ArrowUpRight size={14} />
        </span>
      </div>
    </div>
  );
}