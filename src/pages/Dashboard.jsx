import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Activity,
  Pencil,
  Trash2,
  AlertTriangle, 
  X,
} from "lucide-react";

import { getAllTasks } from "../services/taskService";
import {
  getProjects,
  deleteProject,
  enrichTasksWithProject,
} from "../utils/projectHelper";

import CreateProjectModal from "../components/CreateProjectModal";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null); 

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const projectList = getProjects();
      setProjects(projectList);

      const rawTasks = await getAllTasks();
      const enrichedTasks = enrichTasksWithProject(rawTasks);
      setTasks(enrichedTasks);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "todo").length;
    return { total, completed, inProgress, pending };
  }, [tasks]);

  const progress =
    stats.total === 0
      ? 0
      : Math.round((stats.completed / stats.total) * 100);

  const statConfig = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Pending", value: stats.pending, icon: LayoutDashboard, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  ];

  function handleDeleteClick(projectId) {
    setProjectToDelete(projectId);
  }

  function confirmDelete() {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjects(getProjects());
      setProjectToDelete(null); 
    }
  }

  function handleProjectClick(projectId) {
    navigate(`/kanban/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans selection:bg-indigo-500/30">

      {(showCreateProject || editingProject) && (
        <CreateProjectModal
          editingProject={editingProject}
          onClose={() => {
            setShowCreateProject(false);
            setEditingProject(null);
          }}
          onSaved={() => {
            loadDashboard();
            setEditingProject(null);
            setShowCreateProject(false);
          }}
        />
      )}

      {projectToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 transform scale-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  Delete Project?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Are you sure you want to delete this project? This action will permanently remove the project and all its associated tasks. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/20 transition-all hover:scale-105"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              Manage your projects and track productivity.
            </p>
          </div>

          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20 font-semibold transition-all active:scale-95 hover:shadow-indigo-500/30"
          >
            <Plus size={20} strokeWidth={2.5} />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statConfig.map((stat, idx) => (
            <StatCard key={idx} {...stat} loading={loading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <LayoutDashboard size={20} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-200">Active Projects</h2>
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {projects.length} Projects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                  onEdit={() => setEditingProject(project)}
                  onDelete={() => handleDeleteClick(project.id)} 
                />
              ))}
              
              {projects.length === 0 && !loading && (
                <button 
                  onClick={() => setShowCreateProject(true)}
                  className="col-span-full border-2 border-dashed border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all group"
                >
                  <div className="p-4 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-4 transition-colors">
                    <Plus size={32} />
                  </div>
                  <p className="font-medium">No projects found. Create one?</p>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Activity size={20} className="text-indigo-400" />
                </div>
              <h2 className="text-xl font-bold text-slate-200">Activity</h2>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-300">
                  Overall Completion
                </h3>
                <span className="text-3xl font-bold text-white">{progress}%</span>
              </div>

              <div className="relative h-4 rounded-full bg-slate-800 shadow-inner overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="mt-4 text-sm text-slate-500 flex justify-between">
                <span>0%</span>
                <span>Tasks Done</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, border, loading }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border ${border} bg-slate-800/40 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          {loading ? (
            <div className="h-8 w-16 bg-slate-700/50 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold mt-1 text-slate-100">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color} shadow-sm`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:bg-slate-800/60 cursor-pointer"
    >
      
      <div className="flex justify-between items-start mb-3">
        <div className="pr-4">
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-slate-400 line-clamp-1 mt-1">
              {project.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="Edit Project"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-end text-xs text-slate-500">
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0"
        >
          View Details &rarr;
        </button>
      </div>
    </div>
  );
}