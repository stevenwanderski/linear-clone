"use client";

import { useOptimistic } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createProjectAction } from "@/actions/projects";
import { NewProjectDialog } from "./new-project-dialog";

type Project = { id: string; key: string; name: string; pending?: boolean };

export function SidebarProjects({ projects }: { projects: Project[] }) {
  // A new project shows at once, dimmed. When the save finishes, React swaps in the real list.
  const [shown, addProject] = useOptimistic<Project[], { name: string; key: string }>(projects, (current, p) =>
    [...current, { id: `pending-${p.key}`, key: p.key.toUpperCase(), name: p.name, pending: true }].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );

  // Runs inside the form's action, which React already wraps in a transition, so addProject is allowed here.
  async function create(name: string, key: string) {
    addProject({ name, key });
    try {
      const { error } = await createProjectAction(name, key);
      if (error) toast.error(error);
    } catch {
      toast.error("Couldn't create the project. Try again.");
    }
  }

  return (
    <>
      <div className="mb-1 flex items-center justify-between px-2">
        <h2 className="text-xs font-medium text-muted-foreground">Projects</h2>
        <NewProjectDialog onCreate={create} />
      </div>
      {shown.length === 0 && <p className="px-2 text-sm text-muted-foreground">No projects yet. Use + to add one.</p>}
      <ul>
        {shown.map((p) => {
          const content = (
            <>
              <span className="w-10 font-mono text-muted-foreground">{p.key}</span>
              {p.name}
            </>
          );
          return (
            <li key={p.id}>
              {p.pending ? (
                <div className="flex gap-2 px-2 py-1 text-sm opacity-60">{content}</div>
              ) : (
                <Link href={`/p/${p.key}`} className="flex gap-2 rounded-md px-2 py-1 text-sm hover:bg-sidebar-accent">
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
