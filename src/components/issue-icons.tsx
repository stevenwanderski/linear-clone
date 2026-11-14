import type { issueStatus } from "@/db/schema";

type Status = (typeof issueStatus.enumValues)[number];

// Small 14px icons for issue status. Colours come from `currentColor` via text-* classes.
export function StatusIcon({ status }: { status: Status }) {
  const common = { viewBox: "0 0 14 14", className: "size-3.5 shrink-0", "aria-hidden": true } as const;
  switch (status) {
    case "backlog":
      return (
        <svg {...common} className={`${common.className} text-muted-foreground`}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.4 1.65" />
        </svg>
      );
    case "todo":
      return (
        <svg {...common} className={`${common.className} text-muted-foreground`}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "in_progress":
      return (
        <svg {...common} className={`${common.className} text-amber-500`}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7Z" fill="currentColor" />
        </svg>
      );
    case "done":
      return (
        <svg {...common} className={`${common.className} text-primary`}>
          <circle cx="7" cy="7" r="7" fill="currentColor" />
          <path d="m4.3 7.2 1.8 1.8 3.6-3.8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "canceled":
      return (
        <svg {...common} className={`${common.className} text-muted-foreground`}>
          <circle cx="7" cy="7" r="7" fill="currentColor" />
          <path d="m4.8 4.8 4.4 4.4m0-4.4-4.4 4.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}
