import { Link } from "react-router-dom";
import logo from "../assets/jira-logo.png";

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="h-8 w-8" />
        <span className="text-white font-bold text-lg"> <Link to="/dashboard" className="">JIRA CLONE</Link></span>
      </div>

      <div className="flex gap-6 text-sm text-white">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/kanban" className="hover:underline">Kanban</Link>
        <Link to="/tasks" className="hover:underline">Task List</Link>
        <Link to="/team" className="hover:underline">Team</Link>
      </div>
    </nav>
  );
}
