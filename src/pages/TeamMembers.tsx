import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/authService";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { 
  Mail, Phone, UserCircle2, Shield,
  UserPlus, ArrowLeft, Search,
  ExternalLink, Briefcase
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  position?: string;
  username?: string;
}

export default function TeamMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const numericId = Number(projectId);
  const { user: loggedInUser, permissions } = useAuth(); // ✅ Access permissions

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check if the user is allowed to even see the "Add Talent" section
  const canViewAllUsers = permissions.includes("view_users");

  useEffect(() => {
    if (numericId && !isNaN(numericId)) {
      load();
    } else {
      setLoading(false);
    }
  }, [projectId]);

  async function load() {
    try {
      setLoading(true);

      // ✅ Fetch members and project details first (should be allowed for project members)
      const [membersRes, projectRes] = await Promise.all([
        api.get(`/projects/${numericId}/members`),
        api.get(`/projects/${numericId}`)
      ]);

      const fetchedOwnerId = Number(projectRes.data.userId || projectRes.data.ownerId);
      setOwnerId(fetchedOwnerId);
      const memberIds: number[] = membersRes.data.map((id: any) => Number(id));

      // ✅ Only fetch global users if permissions allow it
      if (canViewAllUsers) {
        try {
          const usersRes = await api.get(`/users`);
          const processedUsers = usersRes.data.map((u: any) => ({
            ...u,
            id: Number(u.id),
            name: u.firstName || u.username || `User #${u.id}`,
            position: u.position || "Developer" 
          }));
          setAllUsers(processedUsers);
          setTeam(processedUsers.filter((u: User) => memberIds.includes(Number(u.id))));
        } catch (err: any) {
          if (err.response?.status === 403) {
            console.warn("User does not have permission to view all users.");
          }
        }
      } else {
        // If can't view all users, at least show basic info for known members
        // (You might need a specific endpoint like /projects/:id/members-details)
        console.log("Permission 'view_users' missing: Only showing member IDs.");
      }

    } catch (err: any) {
      console.error("Load Error:", err);
      if (err.response?.status === 404) {
        toast.error("Project details not found.");
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }
 
  async function addMember(userId: number) {
    try {
      await api.post(`/projects/${numericId}/members`, { userId });
      toast.success("Team member added");
      await load(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  }

  async function removeMember(e: React.MouseEvent, userId: number) {
    e.stopPropagation(); 
    if (!window.confirm("Remove this member from the project?")) return;

    try {
      await api.delete(`/projects/${numericId}/members/${userId}`);
      toast.success("Member removed");
      await load(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  }

  const isOwner = Number(loggedInUser?.id) === Number(ownerId);

  const nonMembers = allUsers.filter(
    u => !team.some(t => Number(t.id) === Number(u.id)) &&
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-full"></div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Syncing Squad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link to={`/kanban/${projectId}`} className="text-slate-500 hover:text-indigo-500 flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest transition-colors">
              <ArrowLeft size={14} /> Back to Board
            </Link>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Project <span className="text-indigo-600">Squad</span>
            </h1>
          </div>

          {canViewAllUsers && (
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input
                type="text"
                placeholder="Search talent to add..."
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
              />
            </div>
          )}
        </div>

        {/* --- Current Members Section --- */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-1 bg-indigo-500 rounded-full"/>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Current Members</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map(u => (
              <MemberCard
                key={u.id}
                user={u}
                isLeader={Number(u.id) === Number(ownerId)}
                canManage={isOwner} 
                onDetails={()=>setSelectedUser(u)}
                onRemove={(e: any)=>removeMember(e, u.id)}
              />
            ))}
          </div>
        </section>

        {/* --- Add Talent Section --- */}
        {canViewAllUsers && (
          <section>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-1 bg-emerald-500 rounded-full"/>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Add Talent</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nonMembers.map(user=>(
                <div key={user.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-10 h-10 rounded-xl" alt="avatar"/>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[9px] text-indigo-500 font-black uppercase truncate">{user.position}</p> 
                    </div>
                  </div>
                  
                  {isOwner && (
                    <button 
                      onClick={()=>addMember(user.id)} 
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm flex-shrink-0"
                    >
                      <UserPlus size={18}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <Modal isOpen={!!selectedUser} onClose={()=>setSelectedUser(null)}>
          {selectedUser && <UserDetails user={selectedUser}/>}
        </Modal>
      </div>
    </div>
  );
}

/* MEMBER CARD */
function MemberCard({user, onDetails, onRemove, isLeader, canManage}: any) {
  return(
    <div onClick={onDetails} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 relative">
      <div className="flex items-center gap-5">
        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-16 h-16 rounded-2xl shadow-sm" alt="avatar"/>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-black text-slate-800 dark:text-white truncate text-lg">{user.name}</h3>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{user.position}</p>
        </div>

        {canManage && !isLeader && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(e);
            }} 
            className="px-3 py-1.5 text-[9px] font-black bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all uppercase"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
        <div className={`text-[9px] font-black px-4 py-1.5 rounded-full flex items-center gap-1.5
          ${isLeader ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"}`}>
          <Shield size={12}/>
          {isLeader ? "OWNER" : "MEMBER"}
        </div>
        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 hover:text-indigo-500 transition-colors uppercase tracking-widest">
          View Details <ExternalLink size={12}/>
        </div>
      </div>
    </div>
  );
}

/* USER DETAILS MODAL */
function UserDetails({user}: any) {
  return(
    <div className="p-4">
      <div className="flex items-center gap-8 mb-12">
        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-24 h-24 rounded-3xl shadow-md" alt="avatar"/>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white truncate">{user.name}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase">{user.position}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Detail icon={<Mail size={18}/>} label="Email Address" value={user.email||"Not public"}/>
        <Detail icon={<Phone size={18}/>} label="Phone Number" value={user.phone||"Not provided"}/>
        <Detail icon={<Briefcase size={18}/>} label="Professional Role" value={user.position}/> 
        <Detail icon={<UserCircle2 size={18}/>} label="Member ID" value={`MEM-${user.id}`}/>
      </div>
    </div>
  );
}

function Detail({icon, label, value}: any) {
  return(
    <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-800">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}