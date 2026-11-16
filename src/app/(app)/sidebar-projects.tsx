"use client";

import { useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectAction } from "@/actions/projects";
import { ProjectBadge } from "@/components/project-badge";
import { NavLink } from "./nav-link";
import { NewProjectDialog } from "./new-project-dialog";

type Project = { id: string; key: string; name: string; color?: string | null; pending?: boolean };
type NewProject = { name: string; key: string; color?: string };

export function SidebarProjects({ projects }: { projects: Project[] }) {
  const router = useRouter();
  // A new project shows at once, dimmed. When the save finishes, React swaps in the real list.
  const [shown, addProject] = useOptimistic<Project[], NewProject>(projects, (current, p) =>
    [...current, { id: `pending-${p.key}`, key: p.key.toUpperCase(), name: p.name, color: p.color, pending: true }].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );

  // Runs inside the form's action, which React already wraps in a transition, so addProject is allowed here.
  async function create(project: NewProject) {
    addProject(project);
    try {
      const { error } = await createProjectAction(project);
      if (error) return void toast.error(error);
      router.push(`/p/${project.key.trim().toUpperCase()}`);
    } catch {
      toast.error("Couldn't create the project. Try again.");
    }
  }

  return (
    <>
      <div className="mt-4 mb-1 flex h-6 items-center justify-between px-2">
        <h2 className="text-xs font-medium text-muted-foreground">Projects</h2>
        <NewProjectDialog onCreate={create} />
      </div>
      {shown.length === 0 && <p className="px-2 text-[13px] text-muted-foreground">No projects yet. Use + to add one.</p>}
      <ul className="grid gap-px">
        {shown.map((p) => {
          const content = (
            <>
              <ProjectBadge projectKey={p.key} color={p.color} />
              <span className="truncate">{p.name}</span>
            </>
          );
          return (
            <li key={p.id}>
              {p.pending ? (
                <div className="flex h-7 items-center gap-2 px-2 text-[13px] opacity-60">{content}</div>
              ) : (
                <NavLink href={`/p/${p.key}`}>{content}</NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
