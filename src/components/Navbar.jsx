import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/jira-logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav className="bg-indigo-600 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="h-8 w-8" />
        <Link to="/dashboard" className="text-white font-bold text-lg">
          JIRA CLONE
        </Link>
      </div>

      <div className="flex gap-6 text-sm text-white items-center">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/tasks" className="hover:underline">
          Task List
        </Link>
        <Link to="/team" className="hover:underline">
          Team
        </Link>

        <button
          onClick={handleLogout}
          className="bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-400"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
