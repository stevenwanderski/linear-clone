import { z } from "zod";
import { and, asc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { issues, issueStatus, projects, user } from "@/db/schema";

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
  priority: z.number().int().min(0).max(4), // 0 none, 1 urgent ... 4 low
  assigneeId: z.string().nullable(),
};

export const createProjectInput = z.object({
  key: projectKey,
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().optional(),
});

export const createIssueInput = z.object({
  projectKey,
  ...issueFields,
  description: issueFields.description.optional(),
  status: issueFields.status.optional(),
  priority: issueFields.priority.optional(),
  assigneeId: issueFields.assigneeId.optional(),
});

// Every field optional: only the ones you pass get changed.
export const updateIssueInput = z.object(issueFields).partial();

// Issue columns plus the project key, so callers can show "WEB-42".
const issueWithKey = { ...getTableColumns(issues), projectKey: projects.key };

// The project id for a key, as a subquery: lets one statement work by "WEB" instead of a UUID.
const projectIdFor = (key: string) =>
  db.select({ id: projects.id }).from(projects).where(eq(projects.key, key));

// Returns null if the key is already taken.
export async function createProject(input: z.input<typeof createProjectInput>) {
  const data = createProjectInput.parse(input);
  const [project] = await db.insert(projects).values(data).onConflictDoNothing({ target: projects.key }).returning();
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
    INSERT INTO ${issues} (project_id, number, title, description, status, priority, assignee_id, creator_id)
    SELECT n.id, n.issue_counter, ${data.title}, ${data.description ?? ""},
           ${data.status ?? "backlog"}::issue_status, ${data.priority ?? 0}::int, ${data.assigneeId ?? null}, ${userId}
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

export async function listIssues(filter: { projectKey?: string; status?: string; assigneeId?: string } = {}) {
  const status = filter.status === undefined ? undefined : issueFields.status.parse(filter.status);
  return db
    .select(issueWithKey)
    .from(issues)
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .where(
      and(
        filter.projectKey ? eq(projects.key, filter.projectKey.toUpperCase()) : undefined,
        status ? eq(issues.status, status) : undefined,
        filter.assigneeId ? eq(issues.assigneeId, filter.assigneeId) : undefined,
      ),
    )
    .orderBy(asc(issues.sortOrder), asc(issues.number));
}

export async function listProjects() {
  return db
    .select({ id: projects.id, key: projects.key, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));
}

// Returns null if no project has this key.
export async function getProject(key: string) {
  const [project] = await db.select().from(projects).where(eq(projects.key, key.toUpperCase()));
  return project ?? null;
}

// Everyone who can be assigned an issue (only allowlisted emails can sign in).
export async function listUsers() {
  return db.select({ id: user.id, name: user.name }).from(user).orderBy(asc(user.name));
}
