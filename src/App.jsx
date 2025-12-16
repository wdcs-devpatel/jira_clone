import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import TaskList from "./pages/TaskList";
import TeamMembers from "./pages/TeamMembers";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kanban/:projectId" element={<KanbanBoard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/team" element={<TeamMembers />} />
      </Routes>
    </>
  );
}
