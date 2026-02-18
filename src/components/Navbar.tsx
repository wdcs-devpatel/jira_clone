import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  
  // --- NEW: State to track the active project ID for dynamic links ---
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem("currentProjectId")
  );

  // Update activeProjectId whenever the URL changes (to catch storage updates)
  useEffect(() => {
    setActiveProjectId(localStorage.getItem("currentProjectId"));
  }, [location]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("currentProjectId"); // Cleanup on logout
    navigate("/");
  };

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white dark:text-indigo-400 font-bold border-b-2 border-white dark:border-indigo-400 pb-1.5 transition-all"
      : "text-indigo-100 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors font-medium";

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 flex justify-between items-center bg-indigo-600 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/10 dark:border-slate-800/60 shadow-md transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-xl shadow-inner dark:bg-slate-800 dark:ring-1 dark:ring-white/10">
          <img src={jiraLogo} alt="logo" className="h-7 w-7 object-contain" />
        </div>
        <Link
          to="/dashboard"
          className="text-white dark:text-slate-50 font-black text-xl tracking-tight"
        >
          JIRA
          <span className="text-indigo-200 dark:text-indigo-500 ml-1">
            CLONE
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-10 text-[13px] uppercase tracking-wider">
        <div className="hidden md:flex gap-10">
          <NavLink to="/dashboard" className={getLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={getLinkClass}>
            Tasks
          </NavLink>
          
          {/* --- MODIFIED: Dynamic Team Link --- */}
          <NavLink 
            to={activeProjectId ? `/team/${activeProjectId}` : "/dashboard"} 
            className={getLinkClass}
          >
            Team
          </NavLink>
        </div>

        <div className="flex items-center gap-5 border-l border-white/20 dark:border-slate-800 pl-8">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/10 dark:bg-slate-800/40 hover:bg-white/20 dark:hover:bg-slate-700/60 dark:hover:ring-1 dark:ring-white/5 transition-all text-white dark:text-amber-300"
          >
            {theme === "dark" ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-white/10 dark:hover:bg-slate-800/60 transition-all border border-transparent dark:hover:border-white/5"
            >
              <div className="h-9 w-9 rounded-xl bg-white/20 dark:bg-indigo-500/10 border border-white/10 dark:border-indigo-500/20 flex items-center justify-center text-white dark:text-indigo-400">
                <User size={20} strokeWidth={2.5} />
              </div>
              <ChevronDown
                size={14}
                className={`text-white dark:text-slate-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
                </div>
                <button
                  onClick={() => { setIsOpen(false); navigate("/profile"); }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-indigo-500/10 transition-colors"
                >
                  <UserCircle size={18} className="text-slate-400" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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