export const APP_NAME = "Jira Clone";
export const API_BASE = "https://dummyjson.com";

/* =======================
   Priority Types
======================= */

// ✅ Added 'critical' to type
export type Priority = "critical" | "high" | "medium" | "low";

export interface PriorityConfig {
  label: string;
  value: Priority;
  color: string;
  bg: string;
  darkBg: string;
  darkText: string;
}

/* =======================
   Priority Config
======================= */

export const PRIORITIES: Record<Priority, PriorityConfig> = {
  // ✅ NEW: Critical Priority Config
  critical: {
    label: "Critical",
    value: "critical",
    color: "text-red-700",
    bg: "bg-red-200",
    darkBg: "dark:bg-red-900/40",
    darkText: "dark:text-red-400",
  },
  high: {
    label: "High",
    value: "high",
    color: "text-orange-600",
    bg: "bg-orange-100",
    darkBg: "dark:bg-orange-500/20",
    darkText: "dark:text-orange-400",
  },
  medium: {
    label: "Medium",
    value: "medium",
    color: "text-amber-600",
    bg: "bg-amber-100",
    darkBg: "dark:bg-amber-500/20",
    darkText: "dark:text-amber-400",
  },
  low: {
    label: "Low",
    value: "low",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    darkBg: "dark:bg-emerald-500/20",
    darkText: "dark:text-emerald-400",
  },
};

export const PRIORITY_LIST: PriorityConfig[] = Object.values(PRIORITIES);