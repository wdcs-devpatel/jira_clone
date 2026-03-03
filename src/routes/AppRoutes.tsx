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

/**
 * APP ROUTES CONFIGURATION
 * Centralized routing hub for the Jira Clone.
 * Standardizes URL parameters (e.g., :projectId) across all features.
 */
function AppRoutes() {
  const location = useLocation();
  const { user, permissions } = useAuth();
  
  // Define paths where the Global Navbar should not be visible
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  // ✅ Comprehensive Admin Check
  // Uses both Role name and Permission gates for robust RBAC protection
  const isAdmin = 
    user?.Role?.name === "Admin" || 
    user?.role === "Admin" ||
    permissions.includes("view_admin_panel") ||
    permissions.includes("manage_users");

  return (
    <>
      {/* Navbar rendered globally except for Auth pages */}
      {!hideNavbar && <Navbar />}
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PRIVATE PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Kanban & Task Management */}
          <Route path="/kanban/:projectId" element={<KanbanBoard />} />
          <Route path="/kanban/:projectId/task/:taskId" element={<TaskDetails />} />
          <Route path="/tasks" element={<TaskList />} />
          
          {/* Team Management - Standardized to :projectId to match TeamMembers.tsx params */}
          <Route path="/team/:projectId" element={<TeamMembers />} />
          
          {/* User Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Administrative Module */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminPage /> : <Navigate to="/dashboard" replace />}
          />
        </Route>

        {/* 404 FALLBACK */}
        <Route path="*" element={
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8">
              <span className="text-4xl font-black text-indigo-600">?</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">
              Out of Bounds
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-xs mx-auto">
              The configuration or module you are looking for does not exist in the current scope.
            </p>
            <Link 
              to="/dashboard" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              Return to Dashboard
            </Link>
          </div>
        } />
      </Routes>
    </>
  );
}

export default AppRoutes;