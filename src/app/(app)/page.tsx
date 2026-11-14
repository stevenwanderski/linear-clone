import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { listIssues } from "@/lib/issues";
import { EmptyState, IssueGroups, ListSkeleton } from "./issue-groups";

async function OpenIssues() {
  await requireUser();
  const issues = await listIssues({ openOnly: true });
  if (issues.length === 0) return <EmptyState>No open issues. Everything is done.</EmptyState>;
  return <IssueGroups rows={issues} />;
}

// Every open issue across all projects. Login lands here.
export default function Home() {
  return (
    <main>
      <PageHeader title="Open issues" />
      <Suspense fallback={<ListSkeleton />}>
        <OpenIssues />
      </Suspense>
    </main>
  );
}
