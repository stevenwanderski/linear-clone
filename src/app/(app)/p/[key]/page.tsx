import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject, listIssues } from "@/lib/issues";
import { IssueList } from "./issue-list";

async function ProjectIssues({ params }: { params: PageProps<"/p/[key]">["params"] }) {
  await requireUser();
  const project = await getProject((await params).key);
  if (!project) notFound();
  const issues = await listIssues({ projectKey: project.key });

  return <IssueList project={{ key: project.key, name: project.name }} issues={issues} />;
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
