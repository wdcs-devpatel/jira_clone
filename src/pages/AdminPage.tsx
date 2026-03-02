import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added for navigation
import { getUsers, updateUserRole, getProfile } from "../services/userService";
import {
  getRolesWithPermissions,
  getAllPermissions,
  updateRolePermissions,
} from "../services/roleService";
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
  UserPlus // ✅ Icon for the create button
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const navigate = useNavigate(); // ✅ Initialize navigate hook
  const { user, permissions, updateUser } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
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

  async function loadInitialData() {
    try {
      setLoading(true);
      const [userData, roleData, permData] = await Promise.all([
        permissions.includes("view_users") ? getUsers() : Promise.resolve([]),
        getRolesWithPermissions(),
        getAllPermissions(),
      ]);

      setUsers(userData);
      setRoles(roleData);
      
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
      <div className="p-10 text-center font-black uppercase text-xs tracking-widest animate-pulse text-indigo-600">
        Initializing Admin Console...
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

          {/* ✅ NEW: Create Personnel Button */}
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
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-10 py-5 font-bold text-slate-900 dark:text-white">{u.username}</td>
                      <td className="px-10 py-5 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-10 py-5">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">
                          {u.Role?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <select
                          value={u.Role?.id}
                          onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                          className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none cursor-pointer hover:ring-2 hover:ring-indigo-500/20 transition-all shadow-sm"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE SECTION HEADER WITH BULK BUTTON */}
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

        {/* ROLE CARDS */}
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