import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const users = JSON.parse(localStorage.getItem("localUsers")) || [];
    const exists = users.find((u) => u.username === form.username || u.email === form.email);
    
    if (exists) {
      setError("Username or Email already exists");
      return;
    }

    const newUser = {
      id: `local-${Date.now()}`,
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };

    users.push(newUser);
    localStorage.setItem("localUsers", JSON.stringify(users));
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4">
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900/50 p-6 text-center border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <UserPlus className="text-indigo-400" /> Create Account
          </h2>
          <p className="text-slate-400 text-sm mt-1">Join us to manage your projects</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" placeholder="First Name" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input name="username" placeholder="Username" onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
              <input type="password" name="confirmPassword" placeholder="Confirm" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" required />
            </div>

            {error && (
               <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} /> <p>{error}</p>
              </div>
            )}

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4">Create Account</button>
          </form>
          <p className="text-sm text-center mt-6 text-slate-400">Already have an account? <button onClick={() => navigate("/")} className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">Login here</button></p>
        </div>
      </div>
    </div>
  );
}