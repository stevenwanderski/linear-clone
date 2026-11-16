"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Columns3Icon, ListTodoIcon, Rows3Icon } from "lucide-react";
import { toast } from "sonner";
import { createIssueAction, updateIssueAction } from "@/actions/issues";
import type { listIssues } from "@/lib/issues";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";
import { ProjectBadge } from "@/components/project-badge";
import { cn } from "@/lib/utils";
import { IssueGroups, type IssueRow } from "../../issue-groups";
import { EditProjectDialog } from "./edit-project-dialog";
import { IssueBoard } from "./issue-board";
import { NewIssueDialog } from "./new-issue-dialog";

type Issue = Awaited<ReturnType<typeof listIssues>>[number];
export type NewIssue = { title: string; description: string; status: IssueRow["status"] };
type Change = ({ type: "add" } & NewIssue) | { type: "move"; id: string; status: IssueRow["status"]; sortOrder: number };
const byPosition = (a: IssueRow, b: IssueRow) => a.sortOrder - b.sortOrder || a.number - b.number;

export function IssueList({
  project,
  issues,
  view,
}: {
  project: { key: string; name: string; color: string | null };
  issues: Issue[];
  view: "list" | "board";
}) {
  // New and moved issues show at once. When the save finishes, React swaps in the real list from the server.
  const [rows, show] = useOptimistic<IssueRow[], Change>(issues, (current, change) =>
    change.type === "add"
      ? [
          ...current,
          // Dimmed with no number yet; sorts to the bottom like a real new issue.
          { id: `pending-${current.length}`, number: 0, title: change.title, status: change.status, sortOrder: Infinity, projectKey: project.key, pending: true },
        ]
      : current.map((row) => (row.id === change.id ? { ...row, status: change.status, sortOrder: change.sortOrder } : row)).sort(byPosition),
  );
  const [, startTransition] = useTransition();

  // Runs inside the form's action, which React already wraps in a transition, so show() is allowed here.
  async function create(issue: NewIssue) {
    show({ type: "add", ...issue });
    try {
      const { error } = await createIssueAction(project.key, issue);
      if (error) toast.error(error);
    } catch {
      toast.error("Couldn't create the issue. Try again.");
    }
  }

  // A drop isn't a form action, so it opens its own transition for the optimistic move.
  function move(row: IssueRow, status: IssueRow["status"], sortOrder: number) {
    startTransition(async () => {
      show({ type: "move", id: row.id, status, sortOrder });
      try {
        await updateIssueAction(`${row.projectKey}-${row.number}`, { status, sortOrder });
      } catch {
        toast.error("Couldn't move the issue. Try again.");
      }
    });
  }

  return (
    <>
      <PageHeader title={<><ProjectBadge projectKey={project.key} color={project.color} />{project.name}<EditProjectDialog project={project} issueCount={issues.length} /></>}>
        <ViewToggle projectKey={project.key} view={view} />
        <NewIssueDialog projectKey={project.key} onCreate={create} />
      </PageHeader>
      {/* An empty project gets the same hint in both views: five empty board columns explain nothing. */}
      {rows.length === 0 ? (
        <Placeholder
          icon={<ListTodoIcon />}
          title={`No issues in ${project.name} yet`}
          action={<NewIssueDialog projectKey={project.key} onCreate={create} label="Create the first issue" />}
          footnote={
            <>
              Or ask Claude Code: <span className="font-mono text-xs text-foreground">&quot;create an issue in {project.key} for …&quot;</span>
            </>
          }
        >
          An issue is one piece of work: a bug, a feature, a task. Each gets a number, like {project.key}-1.
        </Placeholder>
      ) : view === "board" ? (
        <IssueBoard rows={rows} onMove={move} projectKey={project.key} onCreate={create} />
      ) : (
        <IssueGroups rows={rows} />
      )}
    </>
  );
}

// The view lives in the URL (?view=board), so a refresh or a shared link keeps it.
function ViewToggle({ projectKey, view }: { projectKey: string; view: "list" | "board" }) {
  const options = [
    { value: "list", label: "List", href: `/p/${projectKey}`, Icon: Rows3Icon },
    { value: "board", label: "Board", href: `/p/${projectKey}?view=board`, Icon: Columns3Icon },
  ] as const;
  return (
    <nav aria-label="View" className="flex rounded-md border p-0.5">
      {options.map(({ value, label, href, Icon }) => (
        <Link
          key={value}
          href={href}
          aria-current={view === value ? "page" : undefined}
          className={cn(
            "flex h-6 items-center gap-1.5 rounded-sm px-2 text-xs font-medium text-muted-foreground hover:text-foreground",
            view === value && "bg-muted text-foreground",
          )}
        >
          <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
