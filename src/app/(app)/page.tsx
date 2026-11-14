import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth";
import { listIssues } from "@/lib/issues";
import { IssueGroups } from "./issue-groups";

async function OpenIssues() {
  await requireUser();
  const issues = await listIssues({ openOnly: true });
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No open issues. Everything is done.
      </div>
    );
  }
  return <IssueGroups rows={issues} />;
}

// Every open issue across all projects. Login lands here.
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="mb-6 text-lg font-semibold">Open issues</h1>
      <Suspense
        fallback={
          <div className="grid gap-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        }
      >
        <OpenIssues />
      </Suspense>
    </main>
  );
}
