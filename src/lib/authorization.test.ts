import { beforeAll, describe, expect, test, vi } from "vitest";

// Swap the live Neon database for an in-memory Postgres (PGlite), built from the real migrations.
// Everything below runs the real src/lib/issues.ts against it, so no live data is touched.
vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return { db };
});

const { db } = await import("@/db");
const { user } = await import("@/db/schema");
const issues = await import("./issues");

// Alice owns WEB and its issue. Bob has his own project with the same key, to prove keys don't collide.
const alice = "alice";
const bob = "bob";

beforeAll(async () => {
  await db.insert(user).values([
    { id: alice, name: "Alice", email: "alice@example.com" },
    { id: bob, name: "Bob", email: "bob@example.com" },
  ]);
  await issues.createProject(alice, { key: "WEB", name: "Alice's site" });
  await issues.createProject(alice, { key: "API", name: "Alice's API" });
  await issues.createProject(alice, { key: "OPS", name: "Alice's ops" }); // a key Bob never gets
  await issues.createIssue(alice, { projectKey: "WEB", title: "Alice's secret", description: "private" });
  await issues.createProject(bob, { key: "WEB", name: "Bob's site" });
});

describe("projects", () => {
  test("each user lists only their own", async () => {
    expect((await issues.listProjects(alice)).map((p) => p.name).sort()).toEqual(["Alice's API", "Alice's ops", "Alice's site"]);
    expect((await issues.listProjects(bob)).map((p) => p.name)).toEqual(["Bob's site"]);
  });

  test("the same key resolves to each user's own project", async () => {
    expect((await issues.getProject(alice, "WEB"))?.name).toBe("Alice's site");
    expect((await issues.getProject(bob, "WEB"))?.name).toBe("Bob's site");
  });

  test("someone else's project looks like it doesn't exist", async () => {
    expect(await issues.getProject(bob, "API")).toBeNull();
  });

  test("a user can't rename someone else's project", async () => {
    expect(await issues.updateProject(bob, "API", { name: "Hacked" })).toBeNull();
    expect((await issues.getProject(alice, "API"))?.name).toBe("Alice's API");
  });

  test("a key is taken only within a user's own projects", async () => {
    expect(await issues.createProject(alice, { key: "WEB", name: "Duplicate" })).toBeNull();
    expect(await issues.createProject(bob, { key: "API", name: "Bob's API" })).not.toBeNull();
  });
});

describe("deleting a project", () => {
  test("a user can't delete someone else's project", async () => {
    expect(await issues.deleteProject(bob, "OPS")).toBe(false);
    expect(await issues.getProject(alice, "OPS")).not.toBeNull();
  });

  test("deletes only the owner's project with that key, along with its issues", async () => {
    await issues.createProject(alice, { key: "TMP", name: "Alice's temp" });
    await issues.createProject(bob, { key: "TMP", name: "Bob's temp" });
    await issues.createIssue(alice, { projectKey: "TMP", title: "Goes with the project" });
    await issues.createIssue(bob, { projectKey: "TMP", title: "Bob's stays" });

    expect(await issues.deleteProject(alice, "TMP")).toBe(true);
    expect(await issues.getProject(alice, "TMP")).toBeNull();
    expect(await issues.getIssue(alice, "TMP-1")).toBeNull();
    expect(await issues.getIssue(bob, "TMP-1")).toMatchObject({ title: "Bob's stays" });

    await issues.deleteProject(bob, "TMP"); // later tests expect Bob to have no issues
  });
});

describe("issues", () => {
  test("someone else's issue looks like it doesn't exist", async () => {
    expect(await issues.getIssue(alice, "WEB-1")).toMatchObject({ title: "Alice's secret" });
    expect(await issues.getIssue(bob, "WEB-1")).toBeNull();
  });

  test("lists include only the user's own issues", async () => {
    expect(await issues.listIssues(bob)).toEqual([]);
    expect(await issues.listIssues(bob, { projectKey: "WEB" })).toEqual([]);
    expect((await issues.listIssues(alice)).map((i) => i.title)).toEqual(["Alice's secret"]);
  });

  test("a user can't update someone else's issue", async () => {
    expect(await issues.updateIssue(bob, "WEB-1", { title: "Hacked", status: "done", sortOrder: -1 })).toBeNull();
    expect(await issues.getIssue(alice, "WEB-1")).toMatchObject({ title: "Alice's secret", status: "backlog" });
  });

  test("a user can't delete someone else's issue", async () => {
    expect(await issues.deleteIssue(bob, "WEB-1")).toBe(false);
    expect(await issues.getIssue(alice, "WEB-1")).not.toBeNull();
  });

  test("a user can't create an issue in someone else's project", async () => {
    await expect(issues.createIssue(bob, { projectKey: "OPS", title: "Spam" })).rejects.toThrow("Project OPS not found");
    expect(await issues.listIssues(alice, { projectKey: "OPS" })).toEqual([]);
  });

  test("an issue goes into the creator's own project when keys match", async () => {
    const created = await issues.createIssue(bob, { projectKey: "WEB", title: "Bob's issue" });
    expect(created).toMatchObject({ projectKey: "WEB", number: 1, title: "Bob's issue" });
    expect(await issues.getIssue(bob, "WEB-1")).toMatchObject({ title: "Bob's issue" });
    expect(await issues.getIssue(alice, "WEB-1")).toMatchObject({ title: "Alice's secret" });
  });

  test("an unknown user sees nothing", async () => {
    expect(await issues.listProjects("nobody")).toEqual([]);
    expect(await issues.listIssues("nobody")).toEqual([]);
    expect(await issues.getIssue("nobody", "WEB-1")).toBeNull();
  });
});
