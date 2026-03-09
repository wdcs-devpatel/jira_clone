import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import { 
  getCompanies, 
  updateUserCompany, 
  getUserCompanies 
} from "../services/companyService";

// ✅ Import updated Viewer Service functions
import { getViewerRole, checkViewer } from "../services/viewerService";

import {
  Shield,
  Users,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, permissions, updateUser } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [permissionsList, setPermissionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Supports both numeric SQL IDs and the string "viewer" ID
  const [expandedRoles, setExpandedRoles] = useState<Record<number | string, boolean>>({});

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
      
      const [
        userData, 
        roleData, 
        permData, 
        companyData, 
        companyUserData, 
        viewerRole 
      ] = await Promise.all([
        permissions.includes("view_users") ? getUsers() : Promise.resolve([]),
        getRolesWithPermissions(),
        getAllPermissions(),
        getCompanies(),
        getUserCompanies(),
        getViewerRole()
      ]);

      // ✅ Async viewer check for each user to sync SQL and Mongo status
      const mergedUsers = await Promise.all(
        userData.map(async (u: any) => {
          const mapping = companyUserData.find((m: any) => m.userId === u.id);
          const isViewer = await checkViewer(u.id);

          return {
            ...u,
            company: mapping?.company || "WebClues",
            mongoRole: isViewer ? "viewer" : "member"
          };
        })
      );

      setUsers(mergedUsers);
      
      const viewerFormatted = viewerRole
        ? {
            id: "viewer",
            name: "VIEWER",
            Permissions: viewerRole.permissions.map((perm: string, index: number) => ({
              id: `viewer-${index}`,
              name: perm
            }))
          }
        : null;

      const mergedRoles = viewerFormatted ? [...roleData, viewerFormatted] : roleData;
      setRoles(mergedRoles);
      setCompanies(companyData);
      setPermissionsList(permData);

      setExpandedRoles((prev) => {
        const updated: Record<number | string, boolean> = { ...prev };
        mergedRoles.forEach((r: any, index: number) => {
          if (updated[r.id] === undefined) updated[r.id] = index === 0; 
        });
        return updated;
      });
    } catch (err) {
      toast.error("Critical: Failed to synchronize administrative modules.");
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;
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
    const updated: Record<number | string, boolean> = {};
    roles.forEach((r) => { updated[r.id] = newState; });
    setExpandedRoles(updated);
  };

  const toggleRoleExpand = (roleId: number | string) => {
    setExpandedRoles((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  // ✅ UPDATED: Fixed handleRoleChange with Cleanup Logic
  const handleRoleChange = async (userId: number, roleId: any) => {
    try {
      if (roleId === "viewer") {
        // Step A: Assign in MongoDB
        await axios.post("http://localhost:5001/api/viewer/assign", { userId });

        // Update local state immediately
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, mongoRole: "viewer" } : u
          )
        );
        toast.success("Viewer role assigned");
      } else {
        // Step B: ✅ NEW CLEANUP - Remove from MongoDB if switching to SQL role
        await axios.post("http://localhost:5001/api/viewer/remove", { userId });

        // Step C: Update standard SQL role
        await updateUserRole(userId, Number(roleId));

        // Update local state immediately
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, mongoRole: "member", Role: { ...u.Role, id: roleId } } : u
          )
        );
        toast.success("User rank updated successfully");
      }

      // Final full sync from server
      setTimeout(loadInitialData, 300);
    } catch (err) {
      toast.error("Unauthorized or Network Error");
    }
  };

  const handleCompanyChange = async (userId: number, company: string) => {
    try {
      await updateUserCompany(userId, company);
      toast.success("Company updated");
      loadInitialData();
    } catch {
      toast.error("Failed to update company");
    }
  };

  const handlePermissionToggle = async (roleId: number | string, permId: number | string, isAssigned: boolean, rolePerms: any[]) => {
    if (roleId === "viewer") {
      toast.info("Viewer capabilities are managed by the Mongo Service.");
      return;
    }
    try {
      const updatedPermIds = isAssigned
        ? rolePerms.filter((p: any) => p.id !== permId).map((p: any) => p.id)
        : [...rolePerms.map((p: any) => p.id), permId];

      await updateRolePermissions(roleId as number, updatedPermIds);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#0b1220]">
      <div className="p-10 text-center font-black uppercase text-xs tracking-widest animate-pulse text-indigo-600">Initializing Admin Console...</div>
    </div>
  );

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
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Management Console</h1>
              <p className="text-slate-500 font-medium italic">RBAC Engine & System Hierarchy</p>
            </div>
          </div>
          <button onClick={() => navigate("/signup")} className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95">
            <UserPlus size={18} /> Create Personnel
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
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Company</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">App Rank</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-10 py-5 font-bold text-slate-900 dark:text-white">
                        {u.username}
                        <p className="text-[9px] text-slate-400 font-medium normal-case">{u.email}</p>
                      </td>
                      <td className="px-10 py-5">
                        <select
                          value={u.company || "WebClues"}
                          onChange={(e) => handleCompanyChange(u.id, e.target.value)}
                          className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none shadow-sm border-none"
                        >
                          {companies.map((c) => (<option key={c._id} value={c.name}>{c.name}</option>))}
                        </select>
                      </td>
                      
                      <td className="px-10 py-5">
                        <select
                          value={u.mongoRole === "viewer" ? "viewer" : (u.Role?.id || "")}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none shadow-sm"
                        >
                          {roles.filter(r => r.id !== "viewer").map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>

                      <td className="px-10 py-5 text-right flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleStatus(u.id)} className={`p-2 rounded-xl ${u.isActive ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {u.isActive ? <UserX size={18}/> : <UserCheck size={18}/>}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
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
          <button onClick={handleBulkToggle} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-indigo-600 shadow-sm transition-all active:scale-95">
            {allExpanded ? <EyeOff size={14} /> : <Eye size={14} />} {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {roles.map((role) => {
            const isOpen = expandedRoles[role.id];
            const isSystemRole = role.name === "Admin" || role.name === "VIEWER" || role.id === "viewer";

            return (
              <div key={role.id} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-xl overflow-hidden transition-all duration-300 ${isSystemRole ? "border-indigo-500/30 ring-1 ring-indigo-500/10" : "border-slate-200 dark:border-slate-800"}`}>
                <div onClick={() => toggleRoleExpand(role.id)} className="flex justify-between items-center p-8 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-8 rounded-full ${isSystemRole ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                        {role.name} {isSystemRole && <span className="ml-3 text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">🔒 {role.id === "viewer" ? "VIEW ONLY" : "SYSTEM CORE"}</span>}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{role.Permissions?.length || 0} enabled capabilities</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</div>
                </div>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 mt-2 pt-6">
                    {permissionsList.map((perm) => {
                      const isAssigned = role.Permissions?.some((p: any) => p.name === perm.name);
                      return (
                        <label key={perm.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${isSystemRole ? "opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"}`}>
                          {/* ✅ Fixed text-slate-500 typo */}
                          <span className={`text-[10px] font-black uppercase ${isAssigned ? 'text-indigo-600' : 'text-slate-500'}`}>{perm.name.replace(/_/g, " ")}</span>
                          <input type="checkbox" checked={isAssigned} disabled={isSystemRole} onChange={(e) => { e.stopPropagation(); handlePermissionToggle(role.id, perm.id, isAssigned, role.Permissions || []); }} className="w-5 h-5 rounded-lg text-indigo-600" />
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