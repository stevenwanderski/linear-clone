import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProjectBadge } from "@/components/project-badge";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getIssue } from "@/lib/issues";
import { IssueDescription } from "./issue-description";
import { IssueFields, IssueTitle } from "./issue-fields";

async function IssueDetail({ params }: { params: PageProps<"/p/[key]/[number]">["params"] }) {
  await requireUser();
  const { key, number } = await params;
  const issue = await getIssue(`${key}-${number}`);
  if (!issue) notFound();
  const issueRef = `${issue.projectKey}-${issue.number}`;

  return (
    <>
      <PageHeader
        title={
          <>
            <Link href={`/p/${issue.projectKey}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <ProjectBadge projectKey={issue.projectKey} color={issue.projectColor} />
              {issue.projectKey}
            </Link>
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            <span>{issueRef}</span>
          </>
        }
      />
      <div className="flex min-h-[calc(100%-3rem)]">
        <article className="mx-auto w-full max-w-3xl min-w-0 flex-1 px-10 py-8">
          <IssueTitle key={issue.title} issueRef={issueRef} title={issue.title} />
          <IssueDescription issueRef={issueRef} description={issue.description} />
        </article>
        <aside className="w-72 shrink-0 border-l p-4">
          <h2 className="mb-3 px-2 text-xs font-medium text-muted-foreground">Properties</h2>
<IssueFields issueRef={issueRef} status={issue.status} />
        </aside>
      </div>
    </>
  );
}

// The ref comes from the URL, which is only known at request time, so the content streams in.
export default function IssuePage({ params }: PageProps<"/p/[key]/[number]">) {
  return (
    <main className="h-full">
      <Suspense
        fallback={
          <div className="flex gap-8 p-8">
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
