import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllTasks } from "../services/taskService";
import { enrichTasksWithProject, getProjects } from "../utils/projectHelper";
import Modal from "../components/Modal";
import TaskDetails from "./TaskDetails";
// Added icons for better status UI
import { CheckCircle2, Circle, Clock } from "lucide-react"; 

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  async function loadTasks() {
    try {
      const raw = await getAllTasks();
      const enriched = enrichTasksWithProject(raw);
      
      const currentProjects = getProjects();
      const validProjectIds = currentProjects.map(p => p.id);
      const validTasks = enriched.filter(t => validProjectIds.includes(t.projectId));
      
      setTasks(validTasks);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [location.pathname]);

  // Helper function to get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case "done":
        return {
          label: "Done",
          style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <CheckCircle2 size={14} />,
        };
      case "in-progress":
        return {
          label: "In Progress",
          style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: <Clock size={14} />,
        };
      default:
        return {
          label: "To Do",
          style: "bg-slate-700/50 text-slate-400 border-slate-700",
          icon: <Circle size={14} />,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
         <p className="text-slate-400 animate-pulse text-lg font-medium tracking-wide">Loading tasks…</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-end justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Task List
            </h1>
            <p className="text-slate-400 mt-2 text-base leading-relaxed">
              A comprehensive view of all your project tasks.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
             TOTAL: <span className="font-mono text-slate-300 ml-1">{tasks.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
            <div className="col-span-6 md:col-span-7">Task Title</div>
            <div className="col-span-4 md:col-span-3">Project ID</div>
            <div className="col-span-2 text-right md:text-left">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-800/50">
            {tasks.map((task) => {
              // Get style config for this task
              const statusConfig = getStatusConfig(task.status);

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-800/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="col-span-6 md:col-span-7 pr-4">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate leading-snug">
                      {task.title}
                    </p>
                  </div>

                  <div className="col-span-4 md:col-span-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-800 text-indigo-300 border border-slate-700/50 tracking-tight">
                      {task.projectId}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end md:justify-start">
                    {/* --- IMPROVED STATUS BADGE --- */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.style} transition-colors`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                 </svg>
              </div>
              <p className="text-slate-300 text-lg font-semibold tracking-tight">No tasks found</p>
              <p className="text-slate-500 text-sm mt-1">Create a new task in your project board to see it here.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      >
        {selectedTask && <TaskDetails task={selectedTask} />}
      </Modal>
    </div>
  );
}