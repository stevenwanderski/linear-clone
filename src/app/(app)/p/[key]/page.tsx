import { Suspense } from "react";
import { notFound } from "next/navigation";
import { issueStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getProject, listIssues } from "@/lib/issues";
import { NewIssueDialog } from "./new-issue-dialog";

const statusLabels: Record<(typeof issueStatus.enumValues)[number], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

async function ProjectIssues({ params }: { params: PageProps<"/p/[key]">["params"] }) {
  await requireUser();
  const project = await getProject((await params).key);
  if (!project) notFound();
  const issues = await listIssues({ projectKey: project.key });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{project.name}</h1>
        <NewIssueDialog projectKey={project.key} />
      </div>
      {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues yet</p>}
      {issueStatus.enumValues.map((status) => {
        const group = issues.filter((issue) => issue.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status} className="mb-6">
            <h2 className="mb-1 text-xs font-medium text-muted-foreground">
              {statusLabels[status]} <span className="ml-1">{group.length}</span>
            </h2>
            <ul className="divide-y border-y">
              {group.map((issue) => (
                <li key={issue.id} className="flex gap-3 py-2 text-sm">
                  <span className="w-16 shrink-0 font-mono text-muted-foreground">
                    {issue.projectKey}-{issue.number}
                  </span>
                  {issue.title}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

// The project key comes from the URL, which is only known at request time, so the content streams in.
export default function ProjectPage({ params }: PageProps<"/p/[key]">) {
  return (
    <main className="p-8">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ProjectIssues params={params} />
      </Suspense>
    </main>
  );
}
