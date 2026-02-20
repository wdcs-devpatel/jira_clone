import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import { User as UserIcon, Lock, LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(identifier, password);

      // Verify required fields match the new backend rotation response
      if (!data.accessToken || !data.refreshToken || !data.user) {
        throw new Error("Invalid login response from server");
      }

      // FIX: Pass the entire user object (including position) to AuthContext
      // Your backend authController explicitly sends this nested 'user' object
      login(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        },
        data.user // This now includes id, username, email, position, firstName, etc.
      );

      toast.success(`Welcome back, ${data.user.username}!`);
      navigate("/dashboard");

    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials.";

      setError(msg);
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-[#1e3a8a] dark:via-[#1e293b] dark:to-[#1e3a8a] p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <LogIn className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-medium">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all"
          >
            Sign up
          </button>
        </p>

      </div>
    </div>
  );
} 