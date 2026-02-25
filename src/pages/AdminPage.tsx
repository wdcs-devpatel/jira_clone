import { useEffect, useState } from "react";
import { getUsers, updateUserRole } from "../services/userService";
import { getRolesWithPermissions, getAllPermissions, updateRolePermissions } from "../services/roleService";
import { Shield, Users, Lock, Settings } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [userData, roleData, permData] = await Promise.all([
        getUsers(),
        getRolesWithPermissions(),
        getAllPermissions()
      ]);
      setUsers(userData);
      setRoles(roleData);
      setPermissions(permData);
    } catch (err) {
      toast.error("Critical: Failed to load administrative modules.");
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId: number, roleId: number) => {
    try {
      await updateUserRole(userId, roleId);
      toast.success("User rank updated successfully");
      loadInitialData();
    } catch (err) {
      toast.error("Unauthorized or Network Error");
    }
  };

  const handlePermissionToggle = async (roleId: number, permId: number, isAssigned: boolean, rolePerms: any[]) => {
    try {
      // Calculate new permission set
      const updatedPermIds = isAssigned
        ? rolePerms.filter((p: any) => p.id !== permId).map((p: any) => p.id)
        : [...rolePerms.map((p: any) => p.id), permId];

      await updateRolePermissions(roleId, updatedPermIds);
      toast.success("Permissions synchronized");
      loadInitialData(); // Refresh UI to show updated state
    } catch (err) {
      toast.error("Failed to modify role permissions");
    }
  };

  if (loading) return <div className="p-10 text-center font-black uppercase text-xs tracking-widest animate-pulse">Initializing Admin Console...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-[#0b1220] transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-2xl shadow-indigo-500/20">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Management Console</h1>
              <p className="text-slate-500 font-medium">RBAC Engine & User Synchronization</p>
            </div>
          </div>
        </div>

        {/* User Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Users size={18} className="text-indigo-600" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Active Personnel</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">System Role</th>
                  <th className="px-10 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-10 py-5 font-bold text-slate-900 dark:text-white">{u.username}</td>
                    <td className="px-10 py-5 text-slate-500 dark:text-slate-400 text-sm">{u.email}</td>
                    <td className="px-10 py-5">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">
                        {u.Role?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <select 
                        value={u.Role?.id} 
                        onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                        className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-tighter outline-none cursor-pointer"
                      >
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permission Matrix Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {roles.map((role) => (
            <div key={role.id} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{role.name} Capabilities</h3>
                </div>
                {role.is_system && <Lock size={16} className="text-slate-300" />}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {permissions.map((perm) => {
                  const isAssigned = role.Permissions?.some((p: any) => p.id === perm.id);
                  return (
                    <label key={perm.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isAssigned ? 'bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                        {perm.name.replace(/_/g, " ")}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isAssigned}
                        onChange={() => handlePermissionToggle(role.id, perm.id, isAssigned, role.Permissions || [])}
                        className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800" 
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}