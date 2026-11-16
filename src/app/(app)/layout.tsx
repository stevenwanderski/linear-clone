import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { appName } from "@/lib/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/issues";
import { AccountMenu } from "./account-menu";
import { AutoRefresh } from "./auto-refresh";
import { SidebarProjects } from "./sidebar-projects";

async function ProjectList() {
  const user = await requireUser();
  return <SidebarProjects projects={await listProjects(user.id)} />;
}

async function Account() {
  const user = await requireUser();
  return <AccountMenu name={user.name} email={user.email} image={user.image} />;
}

// The sidebar sits on a darker background and each page is a rounded panel beside it.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-screen bg-sidebar">
      <AutoRefresh />
      <aside className="flex w-60 shrink-0 flex-col overflow-y-auto p-3 text-sidebar-foreground">
        <div className="mb-3 flex items-center justify-between pl-1">
          <Link href="/" className="flex items-center gap-2 text-[13px] font-semibold">
            <Logo className="size-5" />
            {appName}
          </Link>
          <ThemeToggle />
        </div>
        {/* Reads the session and the DB at request time, so it streams in behind a boundary. */}
        <Suspense
          fallback={
            <div className="mt-4 grid gap-2 px-2">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Projects</p>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          }
        >
          <ProjectList />
        </Suspense>
        <div className="mt-auto pt-3">
          <Suspense fallback={<Skeleton className="mx-2 h-8 w-32" />}>
            <Account />
          </Suspense>
        </div>
      </aside>
      <div className="my-2 mr-2 min-w-0 flex-1 overflow-y-auto rounded-xl border bg-background shadow-sm">{children}</div>
    </div>
  );
}
