"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectAction } from "@/actions/projects";
import { Logo } from "@/components/logo";
import { Placeholder } from "@/components/placeholder";
import { appName } from "@/lib/brand";
import { NewProjectDialog } from "./new-project-dialog";

type NewProject = { name: string; key: string; color?: string };

// What a brand-new account sees on the home page: one clear next step, then straight into the new project.
export function FirstProject() {
  const router = useRouter();

  async function create(project: NewProject) {
    try {
      const { error } = await createProjectAction(project);
      if (error) return void toast.error(error);
      router.push(`/p/${project.key.trim().toUpperCase()}`); // where the first issue gets made
    } catch {
      toast.error("Couldn't create the project. Try again.");
    }
  }

  return (
    <Placeholder
      icon={<Logo />}
      title={`Welcome to ${appName}`}
      action={<NewProjectDialog onCreate={create} label="Create your first project" />}
      footnote={
        <>
          Using Claude Code?{" "}
          <Link href="/settings" className="text-foreground underline-offset-4 hover:underline">
            Connect it in Settings
          </Link>
        </>
      }
    >
      Start with a project: a home for related issues, like a website or an app. You&apos;ll add issues to it next.
    </Placeholder>
  );
}
