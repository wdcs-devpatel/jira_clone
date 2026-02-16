  import { useEffect, useState } from "react";
  import { getAllTasks } from "../services/taskService";
  import { getProjects } from "../services/projectService";
  import { PRIORITIES } from "../utils/constants";
  import Modal from "../components/Modal";
  import TaskDetails from "./TaskDetails";
  import { 
    CheckCircle2, 
    Circle, 
    Clock, 
    ClipboardList, 
    Search, 
    Filter
  } from "lucide-react";

  type Status = "todo" | "in-progress" | "done";
  type Priority = "high" | "medium" | "low";

  // ✅ Fixed: Interface uses numbers for IDs
  interface Task {
    id: number;
    title: string;
    status: Status;
    priority: Priority;
    projectId: number; 
  }

  export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [projectMap, setProjectMap] = useState<Record<string, string>>({});

    useEffect(() => {
      async function loadInitialData() {
        await loadProjects();
        await loadTasks();
      }
      loadInitialData();
    }, []);

    async function loadProjects() {
      try {
        const projects = await getProjects();
        const map: Record<string, string> = {};
        projects.forEach(p => {
          map[String(p.id)] = p.name;
        });
        setProjectMap(map);
      } catch (err) {
        console.error("Project Mapping Error:", err);
      }
    }

    async function loadTasks() {
      setLoading(true);
      try {
        const projects = await getProjects();
        const taskPromises = projects.map(p => getAllTasks(p.id));
        const tasksPerProject = await Promise.all(taskPromises);
        setTasks(tasksPerProject.flat());
      } catch (err) {
        console.error("Load Tasks Error:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    const filteredTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function getStatusConfig(status: Status) {
      switch (status) {
        case "done":
          return {
            label: "Done",
            style: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
            icon: <CheckCircle2 size={12} />,
          };
        case "in-progress":
          return {
            label: "In Progress",
            style: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
            icon: <Clock size={12} />,
          };
        default:
          return {
            label: "To Do",
            style: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
            icon: <Circle size={12} />,
          };
      }
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Syncing tasks...</p>
        </div>
      );
    }

    return (
      <div className="p-6 md:p-10 min-h-screen bg-slate-50 dark:bg-[#0b1220] transition-colors duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Task List</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage your team's workload.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm w-64 dark:text-white"
                />
              </div>
              <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500 transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-6">Task Title</div>
              <div className="col-span-2 text-center">Priority</div>
              <div className="col-span-2 text-center">Project</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((task) => {
                const p = PRIORITIES[task.priority] || PRIORITIES.medium;
                const status = getStatusConfig(task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="grid grid-cols-12 px-8 py-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </span>
                    </div>
                    
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${p.bg} ${p.color} ${p.darkBg} ${p.darkText}`}>
                        {p.label}
                      </span>
                    </div>

                    <div className="col-span-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                      {projectMap[String(task.projectId)] || 'Unassigned'}
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status.style}`}>
                        {status.icon} {status.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-24 bg-white dark:bg-slate-900">
                <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                  <ClipboardList size={40} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks found matching your criteria</p>
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