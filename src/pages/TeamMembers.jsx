import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import Modal from "../components/Modal";
import { Mail, Phone, Building2, UserCircle2 } from "lucide-react";

export default function TeamMembers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch { 
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  if (loading) {  
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading team members…</p>
      </div>
    );
  } 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Members</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">View and manage your project collaborators.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user.avatar} 
                    alt={user.name}
                    className="w-14 h-14 rounded-full border-2 border-slate-100 dark:border-slate-700 group-hover:border-indigo-500 transition-colors object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate lowercase">
                    @{user.name.replace(/\s+/g, '').toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
          {selectedUser && <UserDetails user={selectedUser} />}
        </Modal>
      </div>
    </div>
  );
}

function UserDetails({ user }) {
  return (
    <div className="text-slate-900 dark:text-white p-2">
      <div className="flex items-center gap-5 mb-8">
        <img
          src={user.avatar} 
          alt={user.name}
          className="w-20 h-20 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">Team Contributor</p>
        </div>
      </div>

      <div className="grid gap-4">
        <DetailItem icon={<Mail size={18} />} label="Email" value={`${user.name.split(' ')[0].toLowerCase()}@example.com`} />
        <DetailItem icon={<Phone size={18} />} label="Access Level" value="Full Access" />
        <DetailItem icon={<Building2 size={18} />} label="Department" value="Engineering" />
        <DetailItem icon={<UserCircle2 size={18} />} label="System ID" value={`MEM-${user.id}`} />
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
      <div className="text-slate-400 dark:text-slate-500">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || "N/A"}</p>
      </div>
    </div>
  );
}