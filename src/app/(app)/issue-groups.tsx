import Link from "next/link";
import type { listIssues } from "@/lib/issues";
import { statusLabels } from "@/lib/labels";

type Issue = Awaited<ReturnType<typeof listIssues>>[number];
export type IssueRow = Pick<Issue, "id" | "number" | "title" | "status" | "projectKey"> & { pending?: boolean };

// Issues under status headings, in workflow order. Used by the project page and "My issues".
export function IssueGroups({ rows }: { rows: IssueRow[] }) {
  return (Object.keys(statusLabels) as Issue["status"][]).map((status) => {
    const group = rows.filter((row) => row.status === status);
    if (group.length === 0) return null;
    return (
      <section key={status} className="mb-6">
        <h2 className="mb-1 text-xs font-medium text-muted-foreground">
          {statusLabels[status]} <span className="ml-1">{group.length}</span>
        </h2>
        <ul className="divide-y border-y">
          {group.map((row) => {
            const content = (
              <>
                <span className="w-16 shrink-0 font-mono text-muted-foreground">
                  {row.projectKey}-{row.pending ? "…" : row.number}
                </span>
                {row.title}
              </>
            );
            return (
              <li key={row.id}>
                {row.pending ? (
                  <div className="flex gap-3 py-2 text-sm opacity-60">{content}</div>
                ) : (
                  <Link href={`/p/${row.projectKey}/${row.number}`} className="flex gap-3 py-2 text-sm hover:bg-muted">
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    );
  });
}
