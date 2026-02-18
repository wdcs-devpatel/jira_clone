import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  ArrowUpRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck 
} from "lucide-react";
import { PRIORITIES } from "../utils/constants";

type Priority = "high" | "medium" | "low";

interface Project {
  id: number;
  name: string;
  description?: string;
  priority: Priority;
  teamLeader?: string; 
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
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
    if (project.id !== undefined) {
      onDelete(project.id);
    }
  };

  const handleNavigate = () => {
    // FIX: Only navigate and set storage if ID exists
    if (project.id) {
      localStorage.setItem("currentProjectId", String(project.id));
      navigate(`/kanban/${project.id}`);
    }
  };

  return (
    <div
      onClick={handleNavigate}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
          {project.name}
        </h3>
        <div
          className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => onEdit(project)} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            <Pencil size={15} />
          </button>
          <button 
            onClick={handleDelete} 
            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-red-500 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed relative z-10">
        {project.description || "No description provided for this project."}
      </p>

      <div className="flex items-center justify-between mt-auto mb-5 relative z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${p.bg} ${p.color} ${p.darkBg} ${p.darkText} dark:bg-opacity-20 border border-transparent dark:border-current/10 shadow-sm`}>
          {project.priority === "high" && <AlertCircle size={12} strokeWidth={2.5} />}
          {project.priority === "medium" && <Clock size={12} strokeWidth={2.5} />}
          {project.priority === "low" && <CheckCircle2 size={12} strokeWidth={2.5} />}
          {p.label}
        </div>

        {project.teamLeader && (
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <UserCheck size={14} className="text-indigo-500" />
            <span>{project.teamLeader}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">PROJECT REF</span>
          <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
            #{String(project.id).padStart(6, '0').toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
          View Board <ArrowUpRight size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}