import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { issueStatus } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createIssue, createProject, deleteIssue, getIssue, listIssues, listProjects, updateIssue } from "@/lib/issues";
import { projectColors, type ProjectColor } from "@/lib/labels";

// The MCP server Claude Code talks to. Every tool is a thin wrapper around src/lib/issues.ts, which
// validates the input again and does the database work, exactly as it does for the web UI.

const status = z.enum(issueStatus.enumValues).describe("One of: backlog, todo, in_progress, done, canceled");
const ref = z.string().describe('Issue ref, e.g. "WEB-42"');

const text = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });
const error = (message: string) => ({ content: [{ type: "text" as const, text: message }], isError: true });

// issues.ts re-checks every input. When that check fails, send back its messages ("Title is required")
// rather than letting the SDK dump the raw validation error.
function friendly<Args extends unknown[], Result>(tool: (...args: Args) => Promise<Result>) {
  return async (...args: Args) => {
    try {
      return await tool(...args);
    } catch (e) {
      if (e instanceof z.ZodError) return error(e.issues.map((issue) => issue.message).join("; "));
      throw e;
    }
  };
}

// The fields worth sending back for an issue; skips internal ids and sort order.
const summary = (issue: NonNullable<Awaited<ReturnType<typeof getIssue>>>) => ({
  ref: `${issue.projectKey}-${issue.number}`,
  title: issue.title,
  status: issue.status,
});

// The owner of the API key this request came with (verifyKey below puts it there). Every tool works on
// that user's projects only. Throws rather than guess, though withMcpAuth already refuses requests without a key.
function userOf(ctx: { http?: { authInfo?: { extra?: Record<string, unknown> } } }) {
  const userId = ctx.http?.authInfo?.extra?.userId;
  if (typeof userId !== "string") throw new Error("Not signed in");
  return userId;
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_projects",
      { title: "List projects", description: "Every project, with the key used in its issue refs." },
      async (ctx) => text(await listProjects(userOf(ctx)).then((rows) => rows.map(({ key, name, color }) => ({ key, name, color })))),
    );

    server.registerTool(
      "list_issues",
      {
        title: "List issues",
        description: "Issues, optionally filtered by project and status. Ordered by status column position.",
        inputSchema: z.object({
          project: z.string().optional().describe('Project key, e.g. "WEB"'),
          status: status.optional(),
          open_only: z.boolean().optional().describe("Leave out done and canceled issues"),
        }),
      },
      async ({ project, status, open_only }, ctx) =>
        text((await listIssues(userOf(ctx), { projectKey: project, status, openOnly: open_only })).map(summary)),
    );

    server.registerTool(
      "get_issue",
      { title: "Get issue", description: "One issue, including its markdown description.", inputSchema: z.object({ ref }) },
      async ({ ref }, ctx) => {
        const issue = await getIssue(userOf(ctx), ref);
        if (!issue) return error(`No issue ${ref}`);
        return text({ ...summary(issue), description: issue.description, createdAt: issue.createdAt, updatedAt: issue.updatedAt });
      },
    );

    server.registerTool(
      "create_issue",
      {
        title: "Create issue",
        description: "Create an issue in a project. It's numbered automatically and goes to the bottom of its status column.",
        inputSchema: z.object({
          project: z.string().describe('Project key, e.g. "WEB"'),
          title: z.string(),
          description: z.string().optional().describe("Markdown"),
          status: status.optional().describe("Defaults to backlog"),
        }),
      },
      friendly(async ({ project, title, description, status }, ctx) =>
        text(summary(await createIssue(userOf(ctx), { projectKey: project, title, description, status }))),
      ),
    );

    server.registerTool(
      "update_issue",
      {
        title: "Update issue",
        description: "Change an issue's title, description, or status. Only the fields you pass change.",
        inputSchema: z.object({
          ref,
          title: z.string().optional(),
          description: z.string().optional().describe("Markdown; replaces the whole description"),
          status: status.optional(),
        }),
      },
      friendly(async ({ ref, ...changes }, ctx) => {
        const issue = await updateIssue(userOf(ctx), ref, changes);
        if (!issue) return error(`No issue ${ref}`);
        return text(summary(issue));
      }),
    );

    server.registerTool(
      "delete_issue",
      {
        title: "Delete issue",
        description: "Permanently delete an issue. This can't be undone; to just close it, set status to canceled.",
        inputSchema: z.object({ ref }),
      },
      async ({ ref }, ctx) => ((await deleteIssue(userOf(ctx), ref)) ? text({ deleted: ref }) : error(`No issue ${ref}`)),
    );

    server.registerTool(
      "create_project",
      {
        title: "Create project",
        description: "Create a project. The key prefixes its issue refs and can't be changed later.",
        inputSchema: z.object({
          key: z.string().describe("2-10 letters or digits, starting with a letter, e.g. WEB"),
          name: z.string(),
          color: z
            .enum(Object.keys(projectColors) as [ProjectColor, ...ProjectColor[]])
            .optional()
            .describe("Defaults to a color picked from the key"),
        }),
      },
      friendly(async (input, ctx) => {
        const project = await createProject(userOf(ctx), input);
        if (!project) return error(`Key ${input.key.trim().toUpperCase()} is already taken`);
        return text({ key: project.key, name: project.name, color: project.color });
      }),
    );
  },
  { serverInfo: { name: "linear-lite", version: "1.0.0" } },
);

// Turns "Authorization: Bearer <key>" into the key's owner. Returning undefined makes withMcpAuth answer 401.
async function verifyKey(_req: Request, bearerToken?: string) {
  if (!bearerToken) return undefined;
  const { valid, key } = await auth.api.verifyApiKey({ body: { key: bearerToken } });
  if (!valid || !key) return undefined;
  return { token: bearerToken, clientId: key.id, scopes: [], extra: { userId: key.referenceId } };
}

const authed = withMcpAuth(handler, verifyKey, { required: true });

export { authed as GET, authed as POST };
