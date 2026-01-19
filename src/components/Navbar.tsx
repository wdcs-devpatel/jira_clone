import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";

import jiraLogo from "../assets/jira-logo.png";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white dark:text-indigo-400 font-semibold border-b-2 border-indigo-400 pb-1"
      : "text-indigo-200 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition";

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 flex justify-between items-center bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 dark:from-[#0b1220] dark:via-[#0f172a] dark:to-[#0b1220] backdrop-blur-xl border-b border-white/10 dark:border-slate-700/60 shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-white/90 dark:bg-slate-900 p-1.5 rounded-lg shadow-sm">
          <img src={jiraLogo} alt="logo" className="h-7 w-7 object-contain" />
        </div>
        <Link
          to="/dashboard"
          className="text-white dark:text-slate-100 font-extrabold text-lg tracking-tight"
        >
          JIRA
          <span className="text-indigo-200 dark:text-indigo-400 ml-0.5">
            CLONE
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-8 text-sm">
        <div className="hidden md:flex gap-8">
          <NavLink to="/dashboard" className={getLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={getLinkClass}>
            Task List
          </NavLink>
          <NavLink to="/team" className={getLinkClass}>
            Team
          </NavLink>
        </div>

        <div className="flex items-center gap-4 border-l border-white/20 dark:border-slate-800 pl-6">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 dark:hover:bg-slate-800 transition-all text-white dark:text-amber-400"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 p-1 pr-4 rounded-2xl hover:bg-white/10 dark:hover:bg-slate-800 transition-all"
            >
              <div className="h-9 w-9 rounded-xl bg-white/20 dark:bg-indigo-500/20 flex items-center justify-center">
                <User size={20} />
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-4 w-60 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full px-4 py-3 flex gap-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <UserCircle size={18} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex gap-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
