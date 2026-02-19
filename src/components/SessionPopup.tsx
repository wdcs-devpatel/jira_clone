interface Props {
  onStay: () => void;
  onLogout: () => void;
}

export default function SessionPopup({ onStay, onLogout }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-96 shadow-2xl text-center border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏳</span>
        </div>
        <h2 className="text-xl font-bold mb-2 dark:text-white">Session Expiring</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Your session will expire in less than 5 minutes. Would you like to stay logged in?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onStay}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}