"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createProject, createProjectInput } from "@/lib/issues";

// `values` echoes back what was typed, so the form can refill itself after an error.
export type CreateProjectState = { ok?: boolean; error?: string; values?: { name: string; key: string } };

export async function createProjectAction(_prev: CreateProjectState, formData: FormData): Promise<CreateProjectState> {
  await requireUser();
  const values = { name: String(formData.get("name") ?? ""), key: String(formData.get("key") ?? "") };
  const input = createProjectInput.safeParse(values);
  if (!input.success) return { error: input.error.issues[0].message, values };

  const project = await createProject(input.data);
  if (!project) return { error: `Key ${input.data.key} is already taken`, values };

  refresh(); // re-render the page so the sidebar shows the new project
  return { ok: true };
}
