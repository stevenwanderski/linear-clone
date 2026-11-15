"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { z } from "zod";
import { createIssue, createIssueInput, deleteIssue, updateIssue, type updateIssueInput } from "@/lib/issues";

export async function createIssueAction(
  projectKey: string,
  fields: Omit<z.input<typeof createIssueInput>, "projectKey">,
): Promise<{ error?: string }> {
  const user = await requireUser();
  const input = createIssueInput.safeParse({ projectKey, ...fields });
  if (!input.success) return { error: input.error.issues[0].message };

  await createIssue(user.id, input.data);
  refresh(); // re-render the page so the list shows the new issue
  return {};
}

// Changes are validated inside updateIssue, since anything can reach a server action.
export async function updateIssueAction(ref: string, changes: z.input<typeof updateIssueInput>) {
  const user = await requireUser();
  await updateIssue(user.id, ref, changes);
  refresh();
}

export async function deleteIssueAction(ref: string) {
  const user = await requireUser();
  await deleteIssue(user.id, ref);
}
