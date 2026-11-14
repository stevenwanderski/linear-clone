import type { issueStatus } from "@/db/schema";

// Display names, kept apart from issues.ts so client components can import them without pulling in the database.
export const statusLabels: Record<(typeof issueStatus.enumValues)[number], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

