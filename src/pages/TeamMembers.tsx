import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/authService";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { 
  Mail, Phone, Building2, UserCircle2, Shield,
  UserPlus, UserMinus, ArrowLeft, Search,
  Users, ExternalLink
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export default function TeamMembers() {
  const { projectId } = useParams();
  const numericId = Number(projectId);
  const { user: loggedInUser } = useAuth();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [projectId]);

  async function load() {
    try {
      setLoading(true);

      const [usersRes, membersRes, projectRes] = await Promise.all([
        api.get(`/users`),
        api.get(`/projects/${numericId}/members`),
        api.get(`/projects/${numericId}`)
      ]);

      setAllUsers(usersRes.data);
      // Normalize ownerId to Number
      setOwnerId(Number(projectRes.data.userId));

      const memberIds: number[] = membersRes.data;
      
      // Normalizing types to ensure strict comparison works
      setTeam(usersRes.data.filter((u: User) => memberIds.includes(Number(u.id))));

    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addMember(userId: number) {
    try {
      await api.post(`/projects/${numericId}/members`, { userId });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Only the project owner can add members");
    }
  }

  async function removeMember(e: React.MouseEvent, userId: number) {
    // Stop propagation so the card's onClick details view doesn't trigger
    e.stopPropagation();
    if (!window.confirm("Remove this member from the project?")) return;

    try {
      await api.delete(`/projects/${numericId}/members/${userId}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  }

  // Normalizing IDs for non-members filtering
  const nonMembers = allUsers.filter(
    u => !team.some(t => Number(t.id) === Number(u.id)) &&
    (u.name || `User #${u.id}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Team...</p>
        </div>
      </div>
    );
  }

  // Permission Check: Stable boolean for the owner status
  const isOwner = Number(loggedInUser?.id) === Number(ownerId);

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

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input
              type="text"
              placeholder="Search talent to add..."
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-1 bg-indigo-500 rounded-full"/>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Current Members
            </h2>
          </div>

          {team.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center">
              <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4"/>
              <p className="text-slate-500 italic">No collaborators assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map(u => (
                <MemberCard
                  key={u.id}
                  user={u}
                  isLeader={Number(u.id) === Number(ownerId)}
                  canManage={isOwner}
                  onDetails={()=>setSelectedUser(u)}
                  onRemove={(e: React.MouseEvent)=>removeMember(e, u.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* --- Add Talent Section: Managed by isOwner check --- */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-1 bg-emerald-500 rounded-full"/>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Add Talent
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nonMembers.map(user=>(
              <div key={user.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name||user.id}`} className="w-10 h-10 rounded-xl" alt="avatar"/>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name||`User #${user.id}`}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase">ID #{user.id}</p>
                  </div>
                </div>
                
                {isOwner && (
                  <button 
                    onClick={()=>addMember(user.id)} 
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                    title="Add to team"
                  >
                    <UserPlus size={18}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <Modal isOpen={!!selectedUser} onClose={()=>setSelectedUser(null)}>
          {selectedUser && <UserDetails user={selectedUser}/>}
        </Modal>

      </div>
    </div>
  );
}

/* MEMBER CARD */

function MemberCard({user, onDetails, onRemove, isLeader, canManage}: any) {
  const avatar=`https://api.dicebear.com/7.x/initials/svg?seed=${user.name||user.id}`;

  return(
    <div onClick={onDetails} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer transition-all hover:shadow-lg relative">
      <div className="flex items-center gap-5">
        <img src={avatar} className="w-16 h-16 rounded-2xl shadow-sm" alt="avatar"/>
        <div className="flex-1">
          <h3 className="font-black text-slate-800 dark:text-white">{user.name||`User #${user.id}`}</h3>
        </div>

        {/* --- Visible Remove Button for Owner --- */}
        {canManage && !isLeader && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Critical Fix: prevents modal from opening
              onRemove(e);
            }} 
            className="px-3 py-1.5 text-[10px] font-black bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-xl transition-all shadow-sm uppercase tracking-wider"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
        <div className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5
          ${isLeader
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"}`}>
          <Shield size={12}/>
          {isLeader ? "LEADER" : "MEMBER"}
        </div>
        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
          Profile <ExternalLink size={12}/>
        </div>
      </div>
    </div>
  );
}

/* USER DETAILS */

function UserDetails({user}: any) {
  const avatar=`https://api.dicebear.com/7.x/initials/svg?seed=${user.name||user.id}`;

  return(
    <div className="p-2">
      <div className="flex items-center gap-6 mb-10">
        <img src={avatar} className="w-24 h-24 rounded-3xl shadow-md" alt="avatar"/>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{user.name||`User #${user.id}`}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">Project Contributor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Detail icon={<Mail size={18}/>} label="Email" value={user.email||"Not assigned"}/>
        <Detail icon={<Phone size={18}/>} label="Phone" value={user.phone||"Not assigned"}/>
        <Detail icon={<Building2 size={18}/>} label="Department" value="Engineering"/>
        <Detail icon={<UserCircle2 size={18}/>} label="ID" value={`MEM-${user.id}`}/>
      </div>
    </div>
  );
}

function Detail({icon, label, value}: any) {
  return(
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}