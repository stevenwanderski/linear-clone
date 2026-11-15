import { Suspense } from "react";
import { headers } from "next/headers";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, requireUser } from "@/lib/auth";
import { ApiKeys } from "./api-keys";

const formatDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format;

async function KeyList() {
  await requireUser();
  const { apiKeys } = await auth.api.listApiKeys({ headers: await headers() });
  const keys = apiKeys
    .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((k) => ({ id: k.id, name: k.name ?? "Untitled", start: k.start, created: formatDate(k.createdAt), expires: k.expiresAt ? formatDate(k.expiresAt) : null }));
  return <ApiKeys keys={keys} />;
}

export default function SettingsPage() {
  return (
    <main>
      <PageHeader title="Settings" />
      <section className="mx-auto grid max-w-2xl gap-4 px-6 py-8">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold">API keys</h2>
          <p className="text-[13px] text-muted-foreground">
            Let Claude Code manage your issues through the MCP server. Each key acts as you. Revoke a key to cut off
            anything using it.
          </p>
        </div>
        {/* Reads the session and the database at request time, so it streams in behind a boundary. */}
        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
          <KeyList />
        </Suspense>
      </section>
    </main>
  );
}
