import { Suspense } from "react";
import Link from "next/link";
import { CircleCheckIcon, ListTodoIcon } from "lucide-react";
import { Placeholder } from "@/components/placeholder";
import { ProjectBadge } from "@/components/project-badge";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { listIssues, listProjects } from "@/lib/issues";
import { FirstProject } from "./first-project";
import { IssueGroups, ListSkeleton } from "./issue-groups";

async function OpenIssues() {
  const user = await requireUser();
  const [projects, issues] = await Promise.all([listProjects(user.id), listIssues(user.id, { openOnly: true })]);
  // A brand-new account: "everything is done" would be wrong, so point at the first step instead.
  if (projects.length === 0) return <FirstProject />;
  if (issues.length > 0) return <IssueGroups rows={issues} showProject />;

  // No open issues: either all done, or none made yet. Only the second case needs a nudge.
  const neverMadeOne = (await listIssues(user.id)).length === 0;
  if (!neverMadeOne) {
    return (
      <Placeholder icon={<CircleCheckIcon />} title="All caught up">
        No open issues across your projects. Everything is done or canceled.
      </Placeholder>
    );
  }
  const first = projects[0];
  return (
    <Placeholder
      icon={<ListTodoIcon />}
      title="No issues yet"
      action={
        <Link href={`/p/${first.key}`} className={buttonVariants()}>
          <ProjectBadge projectKey={first.key} color={first.color} />
          Open {first.name}
        </Link>
      }
    >
      Open issues from all your projects show up here. Add your first one in a project.
    </Placeholder>
  );
}

// Every open issue across your projects. Login lands here.
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
