"use client";

import { useOptimistic } from "react";
import { toast } from "sonner";
import { createIssueAction } from "@/actions/issues";
import type { listIssues } from "@/lib/issues";
import { IssueGroups, type IssueRow } from "../../issue-groups";
import { NewIssueDialog } from "./new-issue-dialog";

type Issue = Awaited<ReturnType<typeof listIssues>>[number];

export function IssueList({ project, issues }: { project: { key: string; name: string }; issues: Issue[] }) {
  // A new issue shows at once, dimmed, with no number yet. When the save finishes, React swaps in the real list.
  const [rows, addRow] = useOptimistic<IssueRow[], string>(issues, (current, title) => [
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
      <IssueGroups rows={rows} />
    </>
  );
}
