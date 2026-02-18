import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import Modal from "../components/Modal";
import { Mail, Phone, Building2, UserCircle2, Shield } from "lucide-react";

interface User {
  id: string | number;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export default function TeamMembers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data as User[]);
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
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">
          Loading team members…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Team Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            View and manage your project collaborators.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

          {users.map((user) => {
            const avatar =
              user.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="
                group cursor-pointer rounded-3xl p-[1px]
                bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                hover:shadow-xl hover:scale-[1.02]
                transition-all duration-300
                "
              >
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-full border border-slate-200 dark:border-slate-800">

                  {/* TOP */}
                  <div className="flex items-center gap-4">

                    {/* AVATAR */}
                    <div className="relative">
                      <img
                        src={avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-2xl object-cover shadow-md"
                      />

                      {/* online dot */}
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>

                    {/* INFO */}
                    <div>
                      <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                        {user.name}
                      </p>

                      <p className="text-sm text-slate-400">
                        @{user.name.toLowerCase().replace(/\s/g, "")}
                      </p>
                    </div>
                  </div>

                  {/* ROLE BADGE */}
                  <div className="mt-6 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                      <Shield size={14} />
                      Team Member
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      ID #{user.id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL */}
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
          {selectedUser && <UserDetails user={selectedUser} />}
        </Modal>
      </div>
    </div>
  );
}

/* ===================== USER DETAILS ===================== */

function UserDetails({ user }: { user: User }) {
  const avatar =
    user.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

  return (
    <div className="text-slate-900 dark:text-white p-2">

      <div className="flex items-center gap-5 mb-8">
        <img
          src={avatar}
          className="w-24 h-24 rounded-3xl object-cover shadow-lg"
        />

        <div>
          <h2 className="text-2xl font-black">{user.name}</h2>
          <p className="text-indigo-500 font-semibold">Project Member</p>
        </div>
      </div>

      <div className="grid gap-4">

        <Detail icon={<Mail size={18}/>} label="Email" value={user.email || "Not provided"} />

        <Detail icon={<Phone size={18}/>} label="Phone" value={user.phone || "Not provided"} />

        <Detail icon={<Building2 size={18}/>} label="Department" value="Engineering" />

        <Detail icon={<UserCircle2 size={18}/>} label="System ID" value={`MEM-${user.id}`} />

      </div>
    </div>
  );
}

/* ===================== DETAIL ROW ===================== */

function Detail({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
      <div className="text-indigo-500">{icon}</div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}