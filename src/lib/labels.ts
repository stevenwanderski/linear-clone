import type { issueStatus } from "@/db/schema";

// Display names, kept apart from issues.ts so client components can import them without pulling in the database.
export const statusLabels: Record<(typeof issueStatus.enumValues)[number], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};


// Project colors, stored by name. Each one reads on both light and dark backgrounds.
export const projectColors = {
  gray: "#94a0b0",
  red: "#e5484d",
  orange: "#f0883e",
  yellow: "#e2b93b",
  green: "#3fb57a",
  teal: "#22b0c4",
  blue: "#4a9cf5",
  pink: "#de5aa0",
};
export type ProjectColor = keyof typeof projectColors;
