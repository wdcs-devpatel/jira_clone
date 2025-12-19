import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import TaskList from "./pages/TaskList";
import TeamMembers from "./pages/TeamMembers";

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/signup";

  return (
    <AuthProvider>
      <ThemeProvider>
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/kanban/:projectId" 
            element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} 
          />
          <Route 
            path="/tasks" 
            element={<ProtectedRoute><TaskList /></ProtectedRoute>} 
          />
          <Route 
            path="/team" 
            element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} 
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}