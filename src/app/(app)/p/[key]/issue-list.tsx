"use client";

import { useOptimistic } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createIssueAction } from "@/actions/issues";
import type { listIssues } from "@/lib/issues";
import { statusLabels } from "@/lib/labels";
import { NewIssueDialog } from "./new-issue-dialog";

type Issue = Awaited<ReturnType<typeof listIssues>>[number];
type Row = Pick<Issue, "id" | "number" | "title" | "status" | "projectKey"> & { pending?: boolean };

export function IssueList({ project, issues }: { project: { key: string; name: string }; issues: Issue[] }) {
  // A new issue shows at once, dimmed, with no number yet. When the save finishes, React swaps in the real list.
  const [rows, addRow] = useOptimistic<Row[], string>(issues, (current, title) => [
    ...current,
    { id: `pending-${current.length}`, number: 0, title, status: "backlog", projectKey: project.key, pending: true },
  ]);

  // Runs inside the form's action, which React already wraps in a transition, so addRow is allowed here.
  async function create(title: string) {
    addRow(title);
    try {
      const { error } = await createIssueAction(project.key, title);
      if (error) toast.error(error);
    } catch {
      toast.error("Couldn't create the issue. Try again.");
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{project.name}</h1>
        <NewIssueDialog projectKey={project.key} onCreate={create} />
      </div>
      {rows.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No issues yet. Use <span className="font-medium text-foreground">New issue</span> to add the first one.
        </div>
      )}
      {(Object.keys(statusLabels) as Issue["status"][]).map((status) => {
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
      })}
    </>
  );
}
