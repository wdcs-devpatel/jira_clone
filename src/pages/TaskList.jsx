import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllTasks } from "../services/taskService";
import { enrichTasksWithProject, getProjects } from "../utils/projectHelper";
import Modal from "../components/Modal";
import TaskDetails from "./TaskDetails";
import { CheckCircle2, Circle, Clock, ClipboardList } from "lucide-react"; 

export default function TaskList() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  async function loadTasks() {
    if (!token) return;
    
    setLoading(true);
    try {
      const raw = await getAllTasks(token);
      const enriched = enrichTasksWithProject(raw, token);
      const currentProjects = getProjects(token);
      
      const validProjectIds = currentProjects.map(p => p.id);
      const validTasks = enriched.filter(t => validProjectIds.includes(t.projectId));
      setTasks(validTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [location.pathname, token]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "done":
        return {
          label: "Done",
          style: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
          icon: <CheckCircle2 size={14} />,
        };
      case "in-progress":
        return {
          label: "In Progress",
          style: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
          icon: <Clock size={14} />,
        };
      default:
        return {
          label: "To Do",
          style: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-700",
          icon: <Circle size={14} />,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
         <p className="text-slate-500 dark:text-slate-400 animate-pulse text-lg font-medium">Loading tasks…</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen font-sans antialiased selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-indigo-400 dark:to-cyan-400 dark:bg-clip-text">
              Task List
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
              A comprehensive view of all your project tasks.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
             TOTAL: <span className="font-mono text-indigo-600 dark:text-slate-300 ml-1">{tasks.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="grid grid-cols-12 px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            <div className="col-span-6 md:col-span-7">Task Title</div>
            <div className="col-span-4 md:col-span-3">Project ID</div>
            <div className="col-span-2 text-right md:text-left">Status</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {tasks.map((task) => {
              const statusConfig = getStatusConfig(task.status);
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="col-span-6 md:col-span-7 pr-4">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                      {task.title}
                    </p>
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700/50">
                      {task.projectId}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end md:justify-start">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.style}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                 <ClipboardList className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-slate-900 dark:text-slate-300 text-lg font-semibold">No tasks found</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Create a new task in your project board to see it here.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        {selectedTask && <TaskDetails task={selectedTask} />}
      </Modal>
    </div>
  );
}