import type { issueStatus } from "@/db/schema";

// Display names, kept apart from issues.ts so client components can import them without pulling in the database.
export const statusLabels: Record<(typeof issueStatus.enumValues)[number], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

// Index = priority value (0 none, 1 urgent ... 4 low).
export const priorityLabels = ["No priority", "Urgent", "High", "Medium", "Low"];
