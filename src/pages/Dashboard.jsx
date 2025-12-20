import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks } from "../services/taskService";
import { getProjects, deleteProject, enrichTasksWithProject } from "../utils/projectHelper";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";
import { LayoutDashboard, CheckCircle2, Clock, ListTodo, Plus, Activity, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null); 

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const projectList = getProjects(token);
      setProjects(projectList);
      const rawTasks = await getAllTasks(token);
      const enrichedTasks = enrichTasksWithProject(rawTasks, token);
      setTasks(enrichedTasks);
    } catch (err) {
      console.error(err);
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
    { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-100" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-100" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-100" },
    { label: "To Do", value: stats.pending, icon: LayoutDashboard, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-100" },
  ];

  function confirmDelete() {
    if (projectToDelete && token) {
      deleteProject(projectToDelete, token);
      setProjects(getProjects(token));
      setProjectToDelete(null); 
    }
  }

  if (!token) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Manage your projects and track productivity.</p>
        </div>
        <button onClick={() => setShowCreateProject(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg transition-all active:scale-95">
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, idx) => (
          <div key={idx} className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                {loading ? <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-2" /> : <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">{stat.value}</p>}
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-indigo-600" />Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onEdit={() => setEditingProject(p)} onDelete={() => setProjectToDelete(p.id)} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> Activity
          </h2>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Overall Completion</h3>
              <span className="text-3xl font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {(showCreateProject || editingProject) && (
        <CreateProjectModal
          editingProject={editingProject}
          onClose={() => { setShowCreateProject(false); setEditingProject(null); }}
          onSaved={() => { loadDashboard(); setShowCreateProject(false); }}
        />
      )}

      {projectToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Delete Project?</h3>
            <p className="text-slate-600 mb-6">This will permanently remove the project and its tasks.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}