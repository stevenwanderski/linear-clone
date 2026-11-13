import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { issueStatus } from "@/db/schema";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProject, listIssues } from "@/lib/issues";
import { statusLabels } from "@/lib/labels";
import { NewIssueDialog } from "./new-issue-dialog";

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
      {issues.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No issues yet. Use <span className="font-medium text-foreground">New issue</span> to add the first one.
        </div>
      )}
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
                <li key={issue.id}>
                  <Link href={`/p/${issue.projectKey}/${issue.number}`} className="flex gap-3 py-2 text-sm hover:bg-muted">
                    <span className="w-16 shrink-0 font-mono text-muted-foreground">
                      {issue.projectKey}-{issue.number}
                    </span>
                    {issue.title}
                  </Link>
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
      <Suspense
        fallback={
          <div className="grid gap-3">
            <Skeleton className="mb-3 h-6 w-48" />
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        }
      >
        <ProjectIssues params={params} />
      </Suspense>
    </main>
  );
}
