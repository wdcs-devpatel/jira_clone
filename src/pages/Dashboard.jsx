import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  TrendingUp,
  Activity,
} from "lucide-react";

import { getAllTasks } from "../services/taskService";
import { PROJECTS, enrichTasksWithProject } from "../utils/projectHelper";
import ProjectCard from "../components/ProjectCard";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await getAllTasks();
      const enriched = enrichTasksWithProject(data);
      setTasks(enriched);
    } catch (err) {
      console.error("Dashboard task load failed", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }


  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "done").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const pending = tasks.filter(t => t.status === "todo").length;

    return { total, completed, inProgress, pending };
  }, [tasks]);

  const progress =
    stats.total === 0
      ? 0
      : Math.round((stats.completed / stats.total) * 100);

  const statConfig = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: LayoutDashboard,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-slate-400 mt-2">
              Welcome back! Here is your project summary.
            </p>
          </div>

          <button
            onClick={() => navigate("/projects/new")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 font-medium active:scale-95"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statConfig.map((stat, index) => (
            <StatCard key={index} {...stat} loading={loading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 h-8">
              <LayoutDashboard size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Active Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROJECTS.map((project) => (
                <div
                  key={project.id}
                  className="hover:-translate-y-1 transition-transform duration-300"
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 h-8">
              <Activity size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Status</h2>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-400" />
                  Overall Progress
                </h3>
                <span className="text-2xl font-bold">{progress}%</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 uppercase">
                  <span>Task Completion</span>
                  <span>{stats.completed}/{stats.total} Done</span>
                </div>

                <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <StatusRow
                  label="In Progress Tasks"
                  value={stats.inProgress}
                  color="text-amber-400"
                />
                <StatusRow
                  label="Open Tasks"
                  value={stats.pending}
                  color="text-indigo-400"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


function StatCard({ title, value, icon: Icon, color, bg, border, loading }) {
  return (
    <div className={`rounded-2xl p-6 border ${border} bg-slate-800/40`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold mt-1">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
      <span className="text-slate-300">{label}</span>
      <span className={`font-mono font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
}
