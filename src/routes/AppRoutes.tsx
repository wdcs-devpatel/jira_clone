import { Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import KanbanBoard from "../pages/KanbanBoard";
import TaskDetails from "../pages/TaskDetails";
import TaskList from "../pages/TaskList";
import TeamMembers from "../pages/TeamMembers";
import Profile from "../pages/Profile";
import AdminPage from "../pages/AdminPage";

function AppRoutes() {
  const location = useLocation();
  const { user, permissions } = useAuth();
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  // ✅ Comprehensive Admin Check
  const isAdmin = 
    user?.Role?.name === "Admin" || 
    permissions.includes("view_admin_panel") ||
    permissions.includes("manage_users");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban/:projectId" element={<KanbanBoard />} />
          <Route path="/kanban/:projectId/task/:taskId" element={<TaskDetails />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/team/:projectId" element={<TeamMembers />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/admin"
            element={isAdmin ? <AdminPage /> : <Navigate to="/dashboard" replace />}
          />
        </Route>

        <Route path="*" element={
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Configuration Not Found</p>
            <Link to="/dashboard" className="text-indigo-600 font-bold uppercase text-xs tracking-widest">
              Return to Dashboard
            </Link>
          </div>
        } />
      </Routes>
    </>
  );
}

export default AppRoutes;