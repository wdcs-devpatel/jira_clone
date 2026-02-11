import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import KanbanBoard from "../pages/KanbanBoard";
import TaskList from "../pages/TaskList";
import TeamMembers from "../pages/TeamMembers";
import Profile from "../pages/Profile";

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban/:projectId" element={<KanbanBoard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/team" element={<TeamMembers />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route
          path="*"
          element={<div className="p-10 text-center text-white">404 - Page Not Found</div>}
        />
      </Routes>
    </>
  );
}

export default AppRoutes;