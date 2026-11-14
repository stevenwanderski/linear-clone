"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { z } from "zod";
import { createIssue, createIssueInput, updateIssue, type updateIssueInput } from "@/lib/issues";

export async function createIssueAction(projectKey: string, title: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const input = createIssueInput.safeParse({ projectKey, title });
  if (!input.success) return { error: input.error.issues[0].message };

  await createIssue(user.id, input.data);
  refresh(); // re-render the page so the list shows the new issue
  return {};
}

// Changes are validated inside updateIssue, since anything can reach a server action.
export async function updateIssueAction(ref: string, changes: z.input<typeof updateIssueInput>) {
  await requireUser();
  await updateIssue(ref, changes);
  refresh();
}
