"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createProject, createProjectInput, updateProject, updateProjectInput } from "@/lib/issues";

export async function createProjectAction(name: string, key: string): Promise<{ error?: string }> {
  await requireUser();
  const input = createProjectInput.safeParse({ name, key });
  if (!input.success) return { error: input.error.issues[0].message };

  const project = await createProject(input.data);
  if (!project) return { error: `Key ${input.data.key} is already taken` };

  refresh(); // re-render the page so the sidebar shows the new project
  return {};
}

export async function updateProjectAction(key: string, changes: { name: string; color?: string }): Promise<{ error?: string }> {
  await requireUser();
  const input = updateProjectInput.safeParse(changes);
  if (!input.success) return { error: input.error.issues[0].message };

  if (!(await updateProject(key, input.data))) return { error: `Project ${key} not found` };

  refresh(); // re-render so the header and sidebar show the change
  return {};
}
