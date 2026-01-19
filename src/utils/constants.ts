export const APP_NAME = "Jira Clone";
export const API_BASE = "https://dummyjson.com";

/* =======================
   Priority Types
======================= */

export type Priority = "high" | "medium" | "low";

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
  high: {
    label: "High",
    value: "high",
    color: "text-rose-600",
    bg: "bg-rose-100",
    darkBg: "dark:bg-rose-500/20",
    darkText: "dark:text-rose-400",
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
