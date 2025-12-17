import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <div
      className="group relative bg-slate-800 border border-slate-700 rounded-xl p-5 hover:-translate-y-1 transition-all cursor-pointer"
      onClick={() => navigate(`/kanban/${project.id}`)}
    >
      <div
        className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(project)}
          className="p-1.5 rounded-md bg-slate-700 hover:bg-indigo-600"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={() => onDelete(project.id)}
          className="p-1.5 rounded-md bg-slate-700 hover:bg-red-600"
        >
          <Trash2 size={14} />
        </button> 
      </div>

      <h3 className="text-lg font-semibold text-white">
        {project.name}
      </h3>

      <p className="text-slate-400 text-sm mt-2">
        {project.description}
      </p>
    </div>
  );
}
