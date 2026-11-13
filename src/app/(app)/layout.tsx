import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/issues";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewProjectDialog } from "./new-project-dialog";

async function ProjectList() {
  await requireUser();
  const projects = await listProjects();
  if (projects.length === 0) return <p className="px-2 text-sm text-muted-foreground">No projects yet. Use + to add one.</p>;
  return (
    <ul>
      {projects.map((p) => (
        <li key={p.id}>
          <Link href={`/p/${p.key}`} className="flex gap-2 rounded-md px-2 py-1 text-sm hover:bg-sidebar-accent">
            <span className="w-10 font-mono text-muted-foreground">{p.key}</span>
            {p.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r bg-sidebar p-3 text-sidebar-foreground">
        <div className="mb-4 flex items-center justify-between px-2">
          <Link href="/" className="font-semibold">Happy Linear</Link>
          <ThemeToggle />
        </div>
        <div className="mb-1 flex items-center justify-between px-2">
          <h2 className="text-xs font-medium text-muted-foreground">Projects</h2>
          <NewProjectDialog />
        </div>
        {/* Reads the session and the DB at request time, so it streams in behind a boundary. */}
        <Suspense
          fallback={
            <div className="grid gap-2 px-2 pt-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          }
        >
          <ProjectList />
        </Suspense>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
