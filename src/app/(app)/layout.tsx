import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/issues";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProjects } from "./sidebar-projects";

async function ProjectList() {
  await requireUser();
  return <SidebarProjects projects={await listProjects()} />;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r bg-sidebar p-3 text-sidebar-foreground">
        <div className="mb-4 flex items-center justify-between px-2">
          <Link href="/" className="font-semibold">Happy Linear</Link>
          <ThemeToggle />
        </div>
        {/* Reads the session and the DB at request time, so it streams in behind a boundary. */}
        <Suspense
          fallback={
            <div className="grid gap-2 px-2">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Projects</p>
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
