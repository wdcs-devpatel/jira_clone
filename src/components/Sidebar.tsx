import { NavLink } from "react-router-dom";
import { LayoutDashboard, Kanban, ListTodo, Users } from "lucide-react";

export default function Sidebar() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/kanban", label: "Kanban", icon: <Kanban size={18} /> },
    { to: "/tasks", label: "Task List", icon: <ListTodo size={18} /> },
    { to: "/team", label: "Team", icon: <Users size={18} /> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors hidden md:block">
      <div className="p-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}