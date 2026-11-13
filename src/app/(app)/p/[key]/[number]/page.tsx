import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getIssue, listUsers } from "@/lib/issues";
import { IssueDescription } from "./issue-description";
import { IssueFields, IssueTitle } from "./issue-fields";

async function IssueDetail({ params }: { params: PageProps<"/p/[key]/[number]">["params"] }) {
  await requireUser();
  const { key, number } = await params;
  const issue = await getIssue(`${key}-${number}`);
  if (!issue) notFound();
  const users = await listUsers();
  const issueRef = `${issue.projectKey}-${issue.number}`;

  return (
    <div className="flex gap-8">
      <article className="min-w-0 flex-1">
        <p className="mb-1 font-mono text-sm text-muted-foreground">
          <Link href={`/p/${issue.projectKey}`} className="hover:underline">{issue.projectKey}</Link>-{issue.number}
        </p>
        <IssueTitle key={issue.title} issueRef={issueRef} title={issue.title} />
        <IssueDescription issueRef={issueRef} description={issue.description} />
      </article>
      <IssueFields
        issueRef={issueRef}
        status={issue.status}
        priority={issue.priority}
        assigneeId={issue.assigneeId}
        users={users}
      />
    </div>
  );
}

// The ref comes from the URL, which is only known at request time, so the content streams in.
export default function IssuePage({ params }: PageProps<"/p/[key]/[number]">) {
  return (
    <main className="p-8">
      <Suspense
        fallback={
          <div className="flex gap-8">
            <div className="grid flex-1 content-start gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid w-64 content-start gap-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-7 w-full" />)}
            </div>
          </div>
        }
      >
        <IssueDetail params={params} />
      </Suspense>
    </main>
  );
}
