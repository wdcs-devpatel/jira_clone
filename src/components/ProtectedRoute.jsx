import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, token } = useAuth();

  
  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}