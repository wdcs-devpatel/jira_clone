import { Link } from "react-router-dom";

export default function Sidebar() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  return (
    <div className="sidebar">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/kanban">Kanban</Link>
      <Link to="/tasks">Task List</Link>
      <Link to="/team">Team</Link>
    </div>
  );
}
