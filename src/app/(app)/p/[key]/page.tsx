import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject, listIssues } from "@/lib/issues";
import { ListSkeleton } from "../../issue-groups";
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
    <main>
      <Suspense
        fallback={
          <>
            <div className="h-12 border-b" />
            <ListSkeleton />
          </>
        }
      >
        <ProjectIssues params={params} />
      </Suspense>
    </main>
  );
}
