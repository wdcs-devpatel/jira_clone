import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/authService";
import {
  UserPlus,
  ArrowLeft
} from "lucide-react";

interface SignupForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      toast.success("Registration successful! You are assigned as Dev.");
      navigate("/");

    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10">

        <div className="text-center mb-8 relative">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 top-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-700"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus className="text-white" size={32} />
          </div>

          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase">
            Join Team
          </h2>

          <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">
            All new users are assigned as Developer
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <input
              name="lastName"
              placeholder="Last Name"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="username"
            placeholder="Username"
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
            value={form.phone}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border outline-none"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 font-bold text-center text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest"
          >
            {isLoading ? "Creating User..." : "Create Account"}
          </button>

        </form>
      </div>
    </div>
  );
}