import { Clock, User, Timer } from "lucide-react";

/**
 * ✅ Types for local Activity and Time Tracking
 */
interface Activity {
  _id: string;
  user: string;
  action: string;
  details?: string;
  createdAt: string;
}

interface LatestLog {
  timeSpent: string;
  dateStarted: string;
}

interface TaskActivityLogProps {
  activities: Activity[];
  totalTime: string;
  latestLog: LatestLog | null;
  onLogTimeClick: () => void;
}

export default function TaskActivityLog({ 
  activities, 
  totalTime, 
  latestLog, 
  onLogTimeClick 
}: TaskActivityLogProps) {
  return (
    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
      
      {/* 📊 Work Tracking Summary Section */}
      <div className="mb-8 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-indigo-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Work Tracking
            </h3>
          </div>
          <button
            onClick={onLogTimeClick}
            className="text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            Log Time
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">
            {totalTime}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total
          </span>
        </div>
        
        {latestLog && (
          <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800/50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              Most Recent Entry
            </p>
            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {latestLog.timeSpent} on {new Date(latestLog.dateStarted).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* 🕒 Activity Timeline Section */}
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2 px-1">
        <Clock size={12} />
        Activity Timeline
      </h3>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <Clock size={20} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest italic text-center">
              No activity records
            </p>
          </div>
        ) : (
          [...activities].reverse().map((activity) => (
            <div
              key={activity._id}
              className="relative pl-6 pb-6 border-l border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
            >
              
              {/* Timeline Dot Connector */}
              <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 shadow-sm" />

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter flex items-center gap-1">
                    <User size={10} />
                    {activity.user}
                  </span>

                  <span className="text-[9px] text-slate-400 font-medium">
                    {new Date(activity.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                <div className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {activity.action}
                </div>

                {activity.details && (
                  <div className="mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/50 italic leading-snug">
                    — {activity.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}