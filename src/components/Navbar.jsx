import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import logo from "../assets/jira-logo.png";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "text-white dark:text-indigo-400 font-semibold border-b-2 border-indigo-400 pb-1"
      : "text-indigo-200 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition";

  return (
    <nav
      className="
        sticky top-0 z-50
        px-6 py-3
        flex justify-between items-center
        bg-gradient-to-r
        from-indigo-600 via-indigo-500 to-indigo-600
        dark:from-[#0b1220] dark:via-[#0f172a] dark:to-[#0b1220]
        backdrop-blur-xl
        border-b border-white/10 dark:border-slate-700/60
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        transition-all duration-300
      "
    >
      <div className="flex items-center gap-3">
        <div className="bg-white/90 dark:bg-slate-900 p-1.5 rounded-lg">
          <img src={logo} alt="logo" className="h-7 w-7" />
        </div>
        <Link
          to="/dashboard"
          className="text-white dark:text-slate-100 font-extrabold text-lg tracking-tight"
        >
          JIRA<span className="text-indigo-200 dark:text-indigo-400">CLONE</span>
        </Link>
      </div>

      <div className="flex items-center gap-8 text-sm">
        <div className="hidden md:flex gap-6">
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

        <div className="flex items-center gap-3 border-l border-white/20 dark:border-slate-700/70 pl-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/20 dark:bg-slate-800 hover:bg-white/30 dark:hover:bg-slate-700 transition text-white dark:text-amber-400"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/20 dark:hover:bg-slate-800 transition"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold uppercase">
                {user?.firstName ? user.firstName[0] : <User size={16} />}
              </div>
              <ChevronDown
                size={14}
                className={`text-white/80 dark:text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-[#101624] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.firstName} {user?.lastName || ""}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
