import Link from "next/link";
import { ProjectBadge } from "@/components/project-badge";
import { StatusIcon } from "@/components/issue-icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { listIssues } from "@/lib/issues";
import { statusLabels } from "@/lib/labels";

type Issue = Awaited<ReturnType<typeof listIssues>>[number];
export type IssueRow = Pick<Issue, "id" | "number" | "title" | "status" | "sortOrder" | "projectKey"> &
  Partial<Pick<Issue, "projectName" | "projectColor">> & { pending?: boolean };

// Issues under status headings, in workflow order. Used by the project page and the home page.
// `showProject` adds each issue's project on the right, for pages that mix projects.
export function IssueGroups({ rows, showProject = false }: { rows: IssueRow[]; showProject?: boolean }) {
  return (Object.keys(statusLabels) as Issue["status"][]).map((status) => {
    const group = rows.filter((row) => row.status === status);
    if (group.length === 0) return null;
    return (
      <section key={status}>
        {/* Inset band with softly rounded corners; mx-3 + px-3 matches the rows' inset, so icons line up. */}
        <h2 className="mx-3 mt-2 mb-1 flex h-8 items-center gap-2 rounded-md bg-muted/60 px-3 text-[13px] font-medium">
          <StatusIcon status={status} />
          {statusLabels[status]}
          <span className="font-normal text-muted-foreground">{group.length}</span>
        </h2>
        <ul className="divide-y divide-border/60 px-3">
          {group.map((row) => {
            const content = (
              <>
                <span className="w-14 shrink-0 text-muted-foreground tabular-nums">
                  {row.projectKey}-{row.pending ? "…" : row.number}
                </span>
                <StatusIcon status={row.status} />
                <span className="truncate">{row.title}</span>
                {showProject && (
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <ProjectBadge projectKey={row.projectKey} color={row.projectColor} />
                    {row.projectName}
                  </span>
                )}
              </>
            );
            return (
              <li key={row.id}>
                {row.pending ? (
                  <div className="flex h-10 items-center gap-3 px-3 text-[13px] opacity-60">{content}</div>
                ) : (
                  <Link href={`/p/${row.projectKey}/${row.number}`} className="flex h-10 items-center gap-3 rounded-md px-3 text-[13px] hover:bg-muted/60">
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

export function ListSkeleton() {
  return (
    <div className="grid gap-3 p-6">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
    </div>
  );
}
