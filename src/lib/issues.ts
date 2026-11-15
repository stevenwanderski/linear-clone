import { z } from "zod";
import { and, asc, eq, getTableColumns, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { issues, issueStatus, projects } from "@/db/schema";
import { projectColors, type ProjectColor } from "./labels";

// "WEB-42" (any case, extra spaces ok) -> { key: "WEB", number: 42 }. Returns null if it isn't a ref.
export function parseRef(ref: string) {
  const match = /^([A-Z][A-Z0-9]*)-([1-9]\d*)$/i.exec(ref.trim());
  if (!match) return null;
  return { key: match[1].toUpperCase(), number: Number(match[2]) };
}

const projectKey = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z][A-Z0-9]{1,9}$/, "Key must be 2-10 letters or digits, starting with a letter");

const issueFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string(),
  status: z.enum(issueStatus.enumValues),
};

export const createProjectInput = z.object({
  key: projectKey,
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().optional(),
  color: z.enum(Object.keys(projectColors) as [ProjectColor, ...ProjectColor[]]).optional(),
});

// The key stays fixed: it is part of every issue ref and URL.
export const updateProjectInput = createProjectInput.pick({ name: true, color: true });

export const createIssueInput = z.object({
  projectKey,
  ...issueFields,
  description: issueFields.description.optional(),
  status: issueFields.status.optional(),
});

// Every field optional: only the ones you pass get changed. sortOrder is the position within a status column.
export const updateIssueInput = z.object({ ...issueFields, sortOrder: z.number().finite() }).partial();

// Issue columns plus the project key (to show "WEB-42") and color.
const issueWithKey = { ...getTableColumns(issues), projectKey: projects.key, projectColor: projects.color };

// The project id for a key, as a subquery: lets one statement work by "WEB" instead of a UUID.
const projectIdFor = (key: string) =>
  db.select({ id: projects.id }).from(projects).where(eq(projects.key, key));

// Returns null if the key is already taken.
export async function createProject(input: z.input<typeof createProjectInput>) {
  const data = createProjectInput.parse(input);
  const [project] = await db.insert(projects).values(data).onConflictDoNothing({ target: projects.key }).returning();
  return project ?? null;
}

// Returns null if no project has that key.
export async function updateProject(key: string, input: z.input<typeof updateProjectInput>) {
  const data = updateProjectInput.parse(input);
  const [project] = await db.update(projects).set(data).where(eq(projects.key, key.toUpperCase())).returning();
  return project ?? null;
}

export async function createIssue(userId: string, input: z.input<typeof createIssueInput>) {
  const { projectKey, ...data } = createIssueInput.parse(input);

  // One statement: bump the project's counter and insert with the new number.
  // The HTTP driver has no transactions, and two separate queries could hand out the same number.
  const result = await db.execute<{ id: string }>(sql`
    WITH n AS (
      UPDATE ${projects} SET issue_counter = issue_counter + 1
      WHERE key = ${projectKey}
      RETURNING id, issue_counter
    )
    INSERT INTO ${issues} (project_id, number, title, description, status, creator_id, sort_order)
    SELECT n.id, n.issue_counter, ${data.title}, ${data.description ?? ""},
           ${data.status ?? "backlog"}::issue_status, ${userId}, n.issue_counter -- new issues go to the bottom of their column
    FROM n
    RETURNING id
  `);
  if (result.rows.length === 0) throw new Error(`Project ${projectKey} not found`);

  const [issue] = await db
    .select(issueWithKey)
    .from(issues)
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .where(eq(issues.id, result.rows[0].id));
  return issue;
}

// Returns null if the ref is malformed or no such issue exists.
export async function getIssue(ref: string) {
  const parsed = parseRef(ref);
  if (!parsed) return null;
  const [issue] = await db
    .select(issueWithKey)
    .from(issues)
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .where(and(eq(projects.key, parsed.key), eq(issues.number, parsed.number)));
  return issue ?? null;
}

export async function updateIssue(ref: string, input: z.input<typeof updateIssueInput>) {
  const parsed = parseRef(ref);
  if (!parsed) return null;
  const data = updateIssueInput.parse(input);
  if (Object.keys(data).length > 0) {
    await db
      .update(issues)
      .set(data)
      .where(and(eq(issues.projectId, projectIdFor(parsed.key)), eq(issues.number, parsed.number)));
  }
  return getIssue(ref);
}

// Returns false if the ref is malformed or no such issue exists. Its number is not reused.
export async function deleteIssue(ref: string) {
  const parsed = parseRef(ref);
  if (!parsed) return false;
  const deleted = await db
    .delete(issues)
    .where(and(eq(issues.projectId, projectIdFor(parsed.key)), eq(issues.number, parsed.number)))
    .returning({ id: issues.id });
  return deleted.length > 0;
}

// `openOnly` leaves out Done and Canceled.
export async function listIssues(
  filter: { projectKey?: string; status?: string; openOnly?: boolean } = {},
) {
  const status = filter.status === undefined ? undefined : issueFields.status.parse(filter.status);
  return db
    .select(issueWithKey)
    .from(issues)
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .where(
      and(
        filter.projectKey ? eq(projects.key, filter.projectKey.toUpperCase()) : undefined,
        status ? eq(issues.status, status) : undefined,
        filter.openOnly ? notInArray(issues.status, ["done", "canceled"]) : undefined,
      ),
    )
    .orderBy(asc(issues.sortOrder), asc(issues.number));
}

export async function listProjects() {
  return db
    .select({ id: projects.id, key: projects.key, name: projects.name, color: projects.color })
    .from(projects)
    .orderBy(asc(projects.name));
}

// Returns null if no project has this key.
export async function getProject(key: string) {
  const [project] = await db.select().from(projects).where(eq(projects.key, key.toUpperCase()));
  return project ?? null;
}
