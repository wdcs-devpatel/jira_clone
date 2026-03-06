import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getUsers, 
  updateUserRole, 
  getProfile, 
  toggleUserStatus, 
  deleteUser
} from "../services/userService";
import {
  getRolesWithPermissions,
  getAllPermissions,
  updateRolePermissions,
} from "../services/roleService";

// ✅ Step 2 — Modify AdminPage imports to include getUserCompanies
import { 
  getCompanies, 
  updateUserCompany, 
  getUserCompanies 
} from "../services/companyService";

import {
  Shield,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  UserCheck,
  UserX,
  Building2
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, permissions, updateUser } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  // ✅ 4. Set default companies state to empty as MongoDB will provide them
  const [companies, setCompanies] = useState<any[]>([]);
  
  const [permissionsList, setPermissionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoles, setExpandedRoles] = useState<Record<number, boolean>>({});

  const allExpanded = useMemo(() => {
    if (roles.length === 0) return false;
    return roles.every((r) => expandedRoles[r.id]);
  }, [roles, expandedRoles]);

  useEffect(() => {
    if (permissions.includes("view_admin_panel")) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [permissions]);

  // ✅ Step 3 — Updated loadInitialData with Merging Logic
  async function loadInitialData() {
    try {
      setLoading(true);
      
      const [userData, roleData, permData, companyData, companyUserData] = await Promise.all([
        permissions.includes("view_users") ? getUsers() : Promise.resolve([]),
        getRolesWithPermissions(),
        getAllPermissions(),
        getCompanies(),
        getUserCompanies() // Fetch mappings from MongoDB
      ]);

      // ✅ Step 4 — Merge company mapping with users
      const mergedUsers = userData.map((u: any) => {
        const mapping = companyUserData.find(
          (m: any) => m.userId === u.id
        );

        return {
          ...u,
          company: mapping?.company || "WebClues" // Fallback to default
        };
      });

      setUsers(mergedUsers); // Use merged data
      setRoles(roleData);
      setCompanies(companyData);
      
      const filteredPerms = permData.filter((p: any) => 
        p.name !== "view_dashboard"
      );
      setPermissionsList(filteredPerms);

      setExpandedRoles((prev) => {
        const updated: Record<number, boolean> = { ...prev };
        roleData.forEach((r: any, index: number) => {
          if (updated[r.id] === undefined) {
            updated[r.id] = index === 0; 
          }
        });
        return updated;
      });
    } catch (err) {
      toast.error("Critical: Failed to load administrative modules.");
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async (userId: number) => {
    if (userId === user?.id) {
      toast.error("You cannot deactivate your own account.");
      return;
    }
    try {
      await toggleUserStatus(userId);
      toast.success("User status updated");
      loadInitialData();
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === user?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user? This action is permanent.")) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      loadInitialData();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleBulkToggle = () => {
    const newState = !allExpanded;
    const updated: Record<number, boolean> = {};
    roles.forEach((r) => {
      updated[r.id] = newState;
    });
    setExpandedRoles(updated);
  };

  const toggleRoleExpand = (roleId: number) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const handleRoleChange = async (userId: number, roleId: number) => {
    try {
      await updateUserRole(userId, roleId);
      toast.success("User rank updated successfully");
      loadInitialData();
    } catch (err) {
      toast.error("Unauthorized or Network Error");
    }
  };

  // ✅ 8. Handle Company Change
  const handleCompanyChange = async (userId: number, company: string) => {
    try {
      await updateUserCompany(userId, company);
      toast.success("Organization mapping updated");
      loadInitialData();
    } catch (err) {
      toast.error("Failed to update company");
    }
  };

  const handlePermissionToggle = async (
    roleId: number,
    permId: number,
    isAssigned: boolean,
    rolePerms: any[]
  ) => {
    try {
      const updatedPermIds = isAssigned
        ? rolePerms.filter((p: any) => p.id !== permId).map((p: any) => p.id)
        : [...rolePerms.map((p: any) => p.id), permId];

      await updateRolePermissions(roleId, updatedPermIds);
      toast.success("Permissions synchronized");

      if (user?.role_id === roleId) {
        const freshProfile = await getProfile();
        updateUser({ permissions: freshProfile.permissions });
      }

      loadInitialData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to modify role permissions");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#0b1220]">
        <div className="p-10 text-center font-black uppercase text-xs tracking-widest animate-pulse text-indigo-600">
          Initializing Admin Console...
        </div>
      </div>
    );

  if (!permissions.includes("view_admin_panel")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1220] p-6 text-center">
        <div className="space-y-4 max-w-md">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Access Denied
          </h1>
          <p className="text-slate-500 font-medium">Insufficient permissions for this administrative module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-[#0b1220] transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-2xl shadow-indigo-500/20">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Management Console
              </h1>
              <p className="text-slate-500 font-medium italic">RBAC Engine & System Hierarchy</p>
            </div>
          </div>

          <button 
            onClick={() => navigate("/signup")}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            Create Personnel
          </button>
        </div>

        {/* USERS TABLE */}
        {permissions.includes("view_users") && (
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
                    {/* ✅ Updated Header for dynamic Company mapping */}
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Company</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-10 py-5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {u.username}
                          {!u.isActive && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase">Inactive</span>}
                        </div>
                      </td>
                      <td className="px-10 py-5 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                      
                      {/* ✅ 5. Dynamic Company Dropdown mapping to MongoDB organizations */}
                      <td className="px-10 py-5">
                        <select
                          value={u.company}
                          onChange={(e) => handleCompanyChange(u.id, e.target.value)}
                          className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none cursor-pointer hover:ring-2 hover:ring-purple-500/20 transition-all shadow-sm border-none"
                        >
                          {companies.map((c) => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-10 py-5">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">
                          {u.Role?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right flex items-center justify-end gap-2">
                        <select
                          value={u.Role?.id}
                          onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                          className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none cursor-pointer hover:ring-2 hover:ring-indigo-500/20 transition-all shadow-sm"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>

                        <button 
                          onClick={() => handleToggleStatus(u.id)}
                          className={`p-2 rounded-xl transition-all ${u.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={u.isActive ? "Deactivate" : "Activate"}
                        >
                          {u.isActive ? <UserX size={18}/> : <UserCheck size={18}/>}
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE SECTION */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Layers size={20} className="text-indigo-600" />
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Role Hierarchy</h2>
          </div>
          
          <button 
            onClick={handleBulkToggle}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            {allExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {roles.map((role) => {
            const isOpen = expandedRoles[role.id];
            const isSystemRole = role.name === "Admin";

            return (
              <div
                key={role.id}
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-xl overflow-hidden transition-all duration-300 ${
                  isSystemRole ? "border-indigo-500/30 ring-1 ring-indigo-500/10" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div
                  onClick={() => toggleRoleExpand(role.id)}
                  className="flex justify-between items-center p-8 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-8 rounded-full ${isSystemRole ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                        {role.name}
                        {isSystemRole && (
                          <span className="ml-3 text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20 tracking-tighter font-bold">
                            🔒 SYSTEM CORE
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {role.Permissions?.length || 0} enabled capabilities
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-300">
                    {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </div>
                </div>

                <div 
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 mt-2 pt-6">
                    {permissionsList.map((perm) => {
                      const isAssigned = role.Permissions?.some((p: any) => p.id === perm.id);

                      return (
                        <label
                          key={perm.id}
                          className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                            isSystemRole
                              ? "opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                              : isAssigned 
                                ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20 cursor-pointer" 
                                : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-tight ${isAssigned ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                            {perm.name.replace(/_/g, " ")}
                          </span>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            disabled={isSystemRole}
                            onChange={(e) => {
                              e.stopPropagation();
                              handlePermissionToggle(role.id, perm.id, isAssigned, role.Permissions || []);
                            }}
                            className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 transition-all active:scale-90"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}