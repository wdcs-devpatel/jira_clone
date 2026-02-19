import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import useSessionTimer from "./hooks/useSessionTimer";
import SessionPopup from "./components/SessionPopup";
import { api } from "./services/authService";

function App() {
  const [showPopup, setShowPopup] = useState(false);

  useSessionTimer(() => setShowPopup(true));

  const stayLoggedIn = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      const res = await api.post("/auth/refresh", { refreshToken });

      localStorage.setItem("accessToken", res.data.accessToken);

      if (res.data.refreshToken)
        localStorage.setItem("refreshToken", res.data.refreshToken);

      setShowPopup(false);
    } catch {
      logoutNow();
    }
  };

  const logoutNow = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <AppRoutes />

      {showPopup && (
        <SessionPopup onStay={stayLoggedIn} onLogout={logoutNow} />
      )}
    </div>
  );
}

export default App;
