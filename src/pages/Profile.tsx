import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Edit3, Check, X, Phone, Mail, User, Shield } from "lucide-react";
import { updateProfile } from "../services/userService";
import { toast } from "react-toastify";
import axios from "axios";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: ""
  });

  // Fetch fresh profile from DB on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateUser(res.data);
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
    }
    fetchProfile();
  }, []);

  // Sync form data whenever the user object updates
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user?.id) {
        throw new Error("User session not found. Please log in again.");
      }

      const result = await updateProfile(user.id, formData);
      updateUser({ ...user, ...result });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-[#0b1220] transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-10 py-8 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                <UserCircle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Account Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your digital identity</p>
              </div>
            </div>

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20">
                  <Check size={18} /> Save
                </button>
                <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all">
                  <X size={18} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="p-10 space-y-8">
            {/* Full Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={16} />
                <label className="text-xs font-black uppercase tracking-[0.2em]">Full Name</label>
              </div>
              <div className="md:col-span-2 flex gap-4">
                {isEditing ? (
                  <>
                    <input className="w-1/2 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    <input className="w-1/2 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </>
                ) : (
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
                )}
              </div>
            </div>

            {/* Username Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield size={16} />
                <label className="text-xs font-black uppercase tracking-[0.2em]">Username</label>
              </div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                ) : (
                  <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-black ring-1 ring-indigo-200 dark:ring-indigo-800/50">@{user?.username}</span>
                )}
              </div>
            </div>

            {/* Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={16} />
                <label className="text-xs font-black uppercase tracking-[0.2em]">Email</label>
              </div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input type="email" className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                ) : (
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.email || "No email provided"}</p>
                )}
              </div>
            </div>

            {/* Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone size={16} />
                <label className="text-xs font-black uppercase tracking-[0.2em]">Phone</label>
              </div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                ) : (
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.phone || "Not Provided"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}