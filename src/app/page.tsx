import { Suspense } from "react";
import { connection } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// Temporary check that the app can reach Neon. Replaced by "My issues" in card 15.
async function DbTime() {
  await connection(); // run on every request, not at build time
  const { rows } = await db.execute<{ now: string }>(sql`select now()`);
  return <p>Database time: {String(rows[0].now)}</p>;
}

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Happy Linear</h1>
      <Suspense fallback={<p>Connecting to database…</p>}>
        <DbTime />
      </Suspense>
    </main>
  );
}
