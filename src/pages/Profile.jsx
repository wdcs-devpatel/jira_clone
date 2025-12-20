import { useAuth } from "../context/AuthContext";
import { UserCircle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-[#0b1220]">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="bg-white dark:bg-[#1e293b] border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UserCircle size={20} /> Personal Details
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-500 uppercase">First Name:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.firstName}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-500 uppercase">Last Name:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.lastName}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-500 uppercase">Username:</span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{user?.username}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase">Phone:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.phone || "Not Set"}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

