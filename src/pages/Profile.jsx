import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Edit3, Check, X, ShieldCheck } from "lucide-react";
import { updateProfile } from "../services/userService";
import { toast } from "react-toastify";

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
        throw new Error("User ID is missing. Please log out and back in.");
      }

      const idStr = user.id.toString();
      const isLocalUser = idStr.startsWith("local-") || (!isNaN(idStr) && parseInt(idStr) > 1000);

      if (isLocalUser) {
        const localUsers = JSON.parse(localStorage.getItem("localUsers")) || [];
        
        if (formData.username !== user.username) {
          const nameTaken = localUsers.some(u => u.username === formData.username && u.id !== user.id);
          if (nameTaken) {
            toast.error("Username already taken!");
            return;
          }
        }

        const updatedLocalUsers = localUsers.map(u => 
          u.id === user.id ? { ...u, ...formData } : u
        );
        
        localStorage.setItem("localUsers", JSON.stringify(updatedLocalUsers));
        updateUser(formData);
        toast.success("Profile saved locally!");
      } else {
        const result = await updateProfile(user.id, formData);
        updateUser(result);
        toast.success("Server profile updated!");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Update failed");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-[#0b1220] transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <UserCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your account identity</p>
              </div>
            </div>

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/20">
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all">
                  <Check size={16} /> Save
                </button>
                <button onClick={handleCancel} className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-all">
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="md:col-span-2 flex gap-2">
                {isEditing ? (
                  <>
                    <input className="w-1/2 text-sm p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    <input className="w-1/2 text-sm p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </>
                ) : (
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 p-1">{user?.firstName} {user?.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                ) : (
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-bold">@{user?.username}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-1">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {user?.email}
                  </p>
                  
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                ) : (
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 p-1">{user?.phone || "Not Provided"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}