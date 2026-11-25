import { Suspense } from "react";
import Link from "next/link";
import { issueStatus } from "@/db/schema";
import { StatusIcon } from "@/components/issue-icons";
import { ProjectBadge } from "@/components/project-badge";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { listIssues, listProjects } from "@/lib/issues";
import { statusLabels } from "@/lib/labels";
import { FirstProject } from "./first-project";
import { ListSkeleton } from "./issue-groups";

async function ProjectCards() {
  const user = await requireUser();
  const [projects, issues] = await Promise.all([listProjects(user.id), listIssues(user.id)]);
  if (projects.length === 0) return <FirstProject />;

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const mine = issues.filter((issue) => issue.projectId === project.id);
        const count = (status: string) => mine.filter((issue) => issue.status === status).length;
        // Canceled issues aren't work left to do, so they don't count toward progress.
        const total = mine.length - count("canceled");
        const percent = total === 0 ? 0 : Math.round((count("done") / total) * 100);

        return (
          <Link
            key={project.id}
            href={`/p/${project.key}`}
            className="grid gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-2 font-medium">
              <ProjectBadge projectKey={project.key} color={project.color} />
              <span className="truncate">{project.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{project.key}</span>
            </div>
            <div className="grid gap-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">
                {count("done")} of {total} done · {percent}%
              </span>
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {issueStatus.enumValues.map((status) => (
                <li key={status} className="flex items-center gap-1" title={statusLabels[status]}>
                  <StatusIcon status={status} />
                  {count(status)}
                </li>
              ))}
            </ul>
          </Link>
        );
      })}
    </div>
  );
}

// One card per project with its progress. Login lands here.
export default function Home() {
  return (
    <main>
      <PageHeader title="Projects" />
      <Suspense fallback={<ListSkeleton />}>
        <ProjectCards />
      </Suspense>
    </main>
  );
}
