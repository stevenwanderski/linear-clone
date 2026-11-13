"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { z } from "zod";
import { createIssue, createIssueInput, updateIssue, type updateIssueInput } from "@/lib/issues";

// `values` echoes back what was typed, so the form can refill itself after an error.
export type CreateIssueState = { ok?: boolean; error?: string; values?: { title: string } };

export async function createIssueAction(
  projectKey: string,
  _prev: CreateIssueState,
  formData: FormData,
): Promise<CreateIssueState> {
  const user = await requireUser();
  const values = { title: String(formData.get("title") ?? "") };
  const input = createIssueInput.safeParse({ projectKey, ...values });
  if (!input.success) return { error: input.error.issues[0].message, values };

  await createIssue(user.id, input.data);
  refresh(); // re-render the page so the list shows the new issue
  return { ok: true };
}

// Changes are validated inside updateIssue, since anything can reach a server action.
export async function updateIssueAction(ref: string, changes: z.input<typeof updateIssueInput>) {
  await requireUser();
  await updateIssue(ref, changes);
  refresh();
}
