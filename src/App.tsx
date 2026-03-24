import AppRoutes from "./routes/AppRoutes";
import SessionPopup from "./components/SessionPopup";
import { useAuth } from "./context/AuthContext";

function App() {
  const { showTimeoutPrompt, triggerRefresh, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <AppRoutes />

      {showTimeoutPrompt && (
        <SessionPopup onStay={triggerRefresh} onLogout={logout} />
      )}
    </div>
  );
}

export default App;