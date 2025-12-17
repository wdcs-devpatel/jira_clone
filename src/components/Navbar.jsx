import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import logo from "../assets/jira-logo.png";
import { useAuth } from "../context/AuthContext"; 

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "text-white font-bold underline decoration-2 underline-offset-4"
      : "text-indigo-200 hover:text-white hover:underline transition-colors";

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest User";
  const displayEmail = user?.email || "guest@example.com";

  return (
    <nav className="bg-indigo-600 px-6 py-3 flex justify-between items-center shadow-md relative z-50">
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="h-8 w-8" />
        <Link to="/dashboard" className="text-white font-bold text-lg tracking-wide">
          JIRA CLONE
        </Link>
      </div>

      <div className="flex gap-6 text-sm items-center">
        <NavLink to="/dashboard" className={getLinkClass}>
          Dashboard
        </NavLink>
        
        <NavLink to="/tasks" className={getLinkClass}>
          Task List
        </NavLink>
        
        <NavLink to="/team" className={getLinkClass}>
          Team
        </NavLink>

        <div className="relative ml-2">
          <button 
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-white hover:bg-indigo-500/50 pl-2 pr-3 py-1.5 rounded-full transition-all focus:outline-none ring-offset-2 focus:ring-2 ring-indigo-400"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-indigo-200 uppercase">
              {user ? user.firstName[0] : <User size={18} />}
            </div>
            
            <span className="font-medium hidden md:block max-w-[100px] truncate">
              {user ? user.firstName : "Profile"}
            </span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
              

              
              <div className="border-t border-slate-100 my-1"></div>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}