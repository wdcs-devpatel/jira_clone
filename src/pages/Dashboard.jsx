import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { getAllTasks } from "../services/taskService";
import {
  getProjects,
  deleteProject,
  enrichTasksWithProject,
} from "../utils/projectHelper";

import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";

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

  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  const statConfig = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/20" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
    { label: "To Do", value: stats.pending, icon: LayoutDashboard, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-500/10", border: "border-slate-100 dark:border-slate-500/20" },
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Project?</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Are you sure? This will permanently remove the project and all its associated tasks.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/20">
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-600 dark:bg-gradient-to-r dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Manage your projects and track productivity.</p>
        </div>
        <button onClick={() => setShowCreateProject(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20 font-semibold transition-all active:scale-95">
          <Plus size={20} strokeWidth={2.5} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, idx) => (
          <div key={idx} className={`relative overflow-hidden rounded-2xl p-5 border ${stat.border} bg-white dark:bg-slate-800/40 shadow-sm dark:shadow-none transition-all hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                {loading ? <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse mt-2" /> : <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">{stat.value}</p>}
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
                <LayoutDashboard size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Active Projects</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{projects.length} Projects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setEditingProject(project)}
                onDelete={() => handleDeleteClick(project.id)} 
              />
            ))}
            {projects.length === 0 && !loading && (
              <button onClick={() => setShowCreateProject(true)} className="col-span-full border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 dark:hover:bg-slate-900/50 transition-all">
                <Plus size={32} className="mb-4" />
                <p className="font-medium">No projects found. Create one?</p>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
              <Activity size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Activity</h2>
          </div>
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300">Overall Completion</h3>
              <span className="text-3xl font-bold text-indigo-600 dark:text-white">{progress}%</span>
            </div>
            <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}