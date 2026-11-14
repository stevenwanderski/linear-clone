"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";
import { auth, requireUser } from "@/lib/auth";

const keyName = z.string().trim().min(1, "Name is required").max(32, "Name must be 32 characters or fewer");

// Returns the full key. This is the only time it exists in plain text: the database keeps a hash.
export async function createApiKeyAction(name: string): Promise<{ key?: string; error?: string }> {
  await requireUser();
  const parsed = keyName.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const created = await auth.api.createApiKey({ body: { name: parsed.data }, headers: await headers() });
  refresh(); // show the new key in the list
  return { key: created.key };
}

// Deleting is how a key is revoked: anything still using it is refused from then on.
export async function revokeApiKeyAction(keyId: string) {
  await requireUser();
  await auth.api.deleteApiKey({ body: { keyId }, headers: await headers() });
  refresh();
}
