"use client";

import { useOptimistic } from "react";
import { toast } from "sonner";
import { createIssueAction } from "@/actions/issues";
import type { listIssues } from "@/lib/issues";
import { PageHeader } from "@/components/page-header";
import { ProjectBadge } from "@/components/project-badge";
import { EmptyState, IssueGroups, type IssueRow } from "../../issue-groups";
import { EditProjectDialog } from "./edit-project-dialog";
import { NewIssueDialog } from "./new-issue-dialog";

type Issue = Awaited<ReturnType<typeof listIssues>>[number];

export function IssueList({ project, issues }: { project: { key: string; name: string; color: string | null }; issues: Issue[] }) {
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
      <PageHeader title={<><ProjectBadge projectKey={project.key} color={project.color} />{project.name}<EditProjectDialog project={project} /></>}>
        <NewIssueDialog projectKey={project.key} onCreate={create} />
      </PageHeader>
      {rows.length === 0 && (
        <EmptyState>
          No issues yet. Use <span className="font-medium text-foreground">New issue</span> to add the first one.
        </EmptyState>
      )}
      <IssueGroups rows={rows} />
    </>
  );
}
