import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition p-5 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
          {project.name[0]}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            {project.name}
          </h3>
          <p className="text-sm text-gray-400">
            {project.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/kanban/${project.id}`)}
        className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
      >
        Go to Board →
      </button>
    </div>
  );
}
