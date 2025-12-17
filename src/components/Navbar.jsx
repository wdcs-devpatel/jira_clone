import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/jira-logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "text-white font-bold underline decoration-2 underline-offset-4" 
      : "text-indigo-200 hover:text-white hover:underline transition-colors"; 

  return (
    <nav className="bg-indigo-600 px-6 py-3 flex justify-between items-center shadow-md">
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

        <button
          onClick={handleLogout}
          className="ml-4 bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-400 transition-colors shadow-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}