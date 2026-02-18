import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext"; // Step 1: Import Auth Context
import { 
  Mail, 
  Phone, 
  Building2, 
  UserCircle2, 
  Shield, 
  UserPlus, 
  UserMinus,
  ArrowLeft, 
  Search,
  Users,
  ExternalLink
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
  const { user: loggedInUser } = useAuth(); // Step 2: Get logged-in user

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    load();
  }, [projectId]);

  async function load() {
    try {
      setLoading(true);
      const [usersRes, membersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects/${numericId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAllUsers(usersRes.data);
      const memberIds: number[] = membersRes.data;
      setTeam(usersRes.data.filter((u: User) => memberIds.includes(u.id)));
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addMember(userId: number) {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/projects/${numericId}/members`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Only the project owner can add members");
    }
  }

  async function removeMember(e: React.MouseEvent, userId: number) {
    e.stopPropagation();
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/projects/${numericId}/members/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  }

  const nonMembers = allUsers.filter(
    u => !team.some(t => t.id === u.id) && 
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
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search talent to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-1 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Current Members</h2>
          </div>

          {team.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center">
              <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 font-medium italic">No collaborators assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map(u => (
                <MemberCard 
                  key={u.id} 
                  user={u} 
                  // Step 3: Pass Leader flag to card
                  isLeader={u.id === Number(localStorage.getItem("userId"))} 
                  onDetails={() => setSelectedUser(u)} 
                  onRemove={(e) => removeMember(e, u.id)} 
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Add Talent</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nonMembers.map(user => (
              <div key={user.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between hover:border-emerald-500 transition-all">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.id}`} className="w-10 h-10 rounded-xl" />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{user.name || `User #${user.id}`}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">ID #{user.id}</p>
                  </div>
                </div>
                <button onClick={() => addMember(user.id)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm">
                  <UserPlus size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
          {selectedUser && <UserDetails user={selectedUser} />}
        </Modal>
      </div>
    </div>
  );
}

// Step 4 & 6: Update MemberCard props and component typing
function MemberCard({ 
  user, 
  onDetails, 
  onRemove, 
  isLeader 
}: { 
  user: User, 
  onDetails: () => void, 
  onRemove: (e: any) => void,
  isLeader?: boolean 
}) {
  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.id}`;

  return (
    <div onClick={onDetails} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative">
          <img src={avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"></span>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">{user.name || `User #${user.id}`}</h3>
          <p className="text-xs text-slate-500 font-medium">@{user.name?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
        </div>
        <button onClick={onRemove} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"><UserMinus size={16} /></button>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
        {/* Step 5: Dynamic Badge UI */}
        <div className={`flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest
          ${isLeader
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          }`}
        >
          <Shield size={12} />
          {isLeader ? "Leader" : "Member"}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-all">Profile <ExternalLink size={12} /></div>
      </div>
    </div>
  );
}

function UserDetails({ user }: { user: User }) {
  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.id}`;
  return (
    <div className="p-2">
      <div className="flex items-center gap-6 mb-10">
        <img src={avatar} className="w-24 h-24 rounded-3xl shadow-2xl shadow-indigo-500/20" />
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{user.name || `User #${user.id}`}</h2>
          <p className="text-indigo-500 font-bold uppercase text-xs tracking-[0.2em] mt-1">Full-stack Engineering</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem icon={<Mail size={18}/>} label="Work Email" value={user.email || "Not assigned"} />
        <DetailItem icon={<Phone size={18}/>} label="Phone Number" value={user.phone || "Not assigned"} />
        <DetailItem icon={<Building2 size={18}/>} label="Department" value="Engineering" />
        <DetailItem icon={<UserCircle2 size={18}/>} label="System ID" value={`MEM-${user.id}`} />
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}