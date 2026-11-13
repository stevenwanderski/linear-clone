# Build Plan: Linear-lite (Option A on Netlify)

A stripped-down Linear: **projects and issues only**, fast keyboard-driven UI, and an **MCP server** so Claude can read and manage issues. Hosted live on Netlify.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** (App Router, server actions, TypeScript) | One codebase for UI, API, and MCP endpoint |
| Host | **Netlify** | Auto-detects Next.js; preview deploy per branch |
| Database | **Postgres on Neon** (direct Neon account) | Serverless-friendly, free tier, branching |
| DB driver | `@neondatabase/serverless` (HTTP) | No connection limits on serverless |
| ORM / migrations | **Drizzle** + `drizzle-kit` | Typed SQL, lightweight |
| Auth | **Better Auth** — GitHub OAuth, `apiKey` plugin, MCP/OAuth-provider plugin | Covers browser login, Claude Code keys, and claude.ai connectors |
| MCP | `mcp-handler` + `@modelcontextprotocol/sdk`, **Streamable HTTP** transport | Stateless, runs in a Next route handler |
| Validation | **Zod** | Shared by server actions and MCP tools |
| UI | **Tailwind** + **shadcn/ui**, `cmdk` (⌘K), `@dnd-kit` (board drag) | Linear-like look with little custom code |
| Markdown | `react-markdown` for display, plain `<textarea>` for editing | Skip rich editors for v1 |

---

## 2. Scope

**In:** GitHub login, projects, issues (title, markdown description, status, priority, assignee), list + board views, ⌘K palette, keyboard shortcuts, MCP server.

**Out (v1):** comments, labels, cycles, teams/workspaces, notifications, attachments, real-time sync, webhooks, mobile app.

**Access model:** one shared workspace. Every signed-in user sees everything. Sign-in is restricted to an **allowlist of GitHub emails** (env var) so strangers can't get in.

---

## 3. Data model

```ts
// src/db/schema.ts (sketch)
users          // managed by Better Auth (plus its session/account/apikey/oauth tables)

projects
  id            uuid pk
  key           text unique        // "WEB" — used in issue IDs
  name          text
  description   text null
  issue_counter int default 0      // next issue number
  created_at    timestamptz

issues
  id            uuid pk
  project_id    uuid fk -> projects (cascade delete)
  number        int                // WEB-42 → 42
  title         text
  description   text default ''    // markdown
  status        enum('backlog','todo','in_progress','done','canceled') default 'backlog'
  priority      int 0..4 default 0 // 0 none, 1 urgent, 2 high, 3 medium, 4 low (Linear's order)
  assignee_id   text fk -> users null
  creator_id    text fk -> users
  sort_order    double precision   // ordering within a status column
  created_at, updated_at timestamptz
  unique (project_id, number)
  index (project_id, status)
```

**Issue numbering** (no interactive transactions on the HTTP driver) — do it in one SQL statement:

```sql
WITH n AS (
  UPDATE projects SET issue_counter = issue_counter + 1
  WHERE id = $1 RETURNING issue_counter
)
INSERT INTO issues (project_id, number, title, ...)
SELECT $1, n.issue_counter, $2, ... FROM n
RETURNING *;
```

---

## 4. App structure

```
src/
  app/
    (auth)/login/page.tsx
    (app)/layout.tsx                 // sidebar: project list, ⌘K
    (app)/page.tsx                   // "My issues"
    (app)/p/[key]/page.tsx           // project issues: list | board toggle
    (app)/p/[key]/[number]/page.tsx  // issue detail
    (app)/settings/page.tsx          // API keys for Claude Code
    api/auth/[...all]/route.ts       // Better Auth
    api/mcp/route.ts                 // MCP server
    .well-known/oauth-*/route.ts     // OAuth metadata for claude.ai connectors
  db/schema.ts, db/index.ts
  lib/auth.ts                        // Better Auth config
  lib/issues.ts                      // ALL issue/project logic lives here
  actions/                           // thin server actions → lib/issues.ts
```

**Rule:** `lib/issues.ts` is the only place that touches the database. Server actions and MCP tools both call it, so UI and Claude always behave the same.

---

## 5. MCP server

Endpoint: `https://<site>.netlify.app/api/mcp`

| Tool | Input | Returns |
|---|---|---|
| `list_projects` | — | key, name, open issue count |
| `list_issues` | `project?`, `status?`, `assignee?` (`"me"` ok), `query?`, `limit?` | compact list: `WEB-42`, title, status, priority |
| `get_issue` | `id` ("WEB-42") | full issue incl. description |
| `create_issue` | `project`, `title`, `description?`, `status?`, `priority?`, `assignee?` | created issue |
| `update_issue` | `id`, any of the fields above | updated issue |
| `create_project` | `key`, `name`, `description?` | created project |

Notes:
- Accept human references (`"WEB-42"`, `"me"`, project key) so Claude never needs to look up UUIDs.
- Clear tool descriptions — they are Claude's only docs.
- Every tool resolves the caller's user from the auth token; it never trusts a user ID from the input.

**Auth, two stages:**
1. **API key** (phase 5): user creates a key in Settings; Claude Code sends it as `Authorization: Bearer <key>`.
   `claude mcp add --transport http linear-lite https://<site>.netlify.app/api/mcp --header "Authorization: Bearer <key>"`
2. **OAuth** (phase 6): Better Auth's MCP/OAuth-provider plugin + `.well-known` metadata routes, so claude.ai → Settings → Connectors → "Add custom connector" works.

---

## 6. Phases

Each phase ends deployed and working on Netlify.

### Phase 0 — Skeleton & deploy (½ day)
- `create-next-app` (TS, Tailwind, App Router), init shadcn/ui.
- Push to GitHub, connect to Netlify, confirm the live URL loads.
- Create the Neon database (Neon account, not Netlify Database); add `DATABASE_URL` in Netlify env.
- Drizzle setup, first migration, a page that reads `select 1`.
- **Done when:** live URL shows data from Neon.

### Phase 1 — Auth (½ day)
- Better Auth with GitHub provider; create the GitHub OAuth app (callback: `<site>/api/auth/callback/github`; make a second OAuth app for localhost).
- Email allowlist check on sign-in.
- Middleware redirects signed-out users to `/login` (cookie check only — no DB call in middleware, it runs at the edge).
- **Done when:** you can sign in on the live site; a non-allowlisted account is rejected.

### Phase 2 — Projects & issues CRUD (1–2 days)
- Schema + migration for `projects`, `issues`.
- `lib/issues.ts` with Zod-validated create/update/list/get.
- Sidebar with projects, create-project dialog.
- Project page: issue list grouped by status; create-issue dialog.
- Issue detail page: edit title, description (textarea + preview), status, priority, assignee.
- **Done when:** you can manage real issues end to end on the live site.

### Phase 3 — Make it feel like Linear (1–2 days)
- ⌘K palette: jump to project/issue, create issue.
- Shortcuts: `c` create, `j/k` move, `s` status, `p` priority, `a` assignee, `esc` back.
- Board view with drag between status columns (`@dnd-kit`, updates `status` + `sort_order`).
- Optimistic updates (`useOptimistic`) so changes appear instantly.
- "My issues" home page.
- **Done when:** you can triage without touching the mouse.

### Phase 4 — Search & filters (½ day)
- Filter by status/priority/assignee in the URL query string (shareable links).
- Title/description search with Postgres `ILIKE` (upgrade to full-text search only if it gets slow).

### Phase 5 — MCP server with API keys (1 day)
- Better Auth `apiKey` plugin + Settings page to create/revoke keys (shown once, stored hashed).
- `api/mcp/route.ts` with `createMcpHandler`; tools call `lib/issues.ts`.
- Test locally with MCP Inspector (`npx @modelcontextprotocol/inspector`), then from Claude Code against the live URL.
- **Done when:** in Claude Code, "create an issue in WEB for X" shows up in the browser.

### Phase 6 — OAuth for claude.ai connectors (1 day)
- Enable Better Auth's MCP/OAuth-provider plugin; add the `.well-known` OAuth metadata routes.
- Make the MCP route accept either an API key or an OAuth access token.
- **Done when:** claude.ai custom connector connects, asks you to log in, and lists your projects.
- ⚠️ The MCP auth spec changes often — check the current Better Auth and MCP docs before starting.

### Phase 7 — Polish (open-ended)
- Empty states, loading skeletons, error toasts, dark mode.
- Custom domain on Netlify.
- Later ideas: comments, labels, real-time updates (Pusher/Ably, or move to a long-running host).

**Rough total:** 6–9 focused days.

---

## 7. Netlify setup

- Build: auto-detected Next.js (OpenNext adapter). No `netlify.toml` needed to start.
- Env vars (Site settings → Environment variables):
  ```
  DATABASE_URL           # Neon pooled / HTTP URL
  BETTER_AUTH_SECRET     # openssl rand -base64 32
  BETTER_AUTH_URL        # https://<site>.netlify.app
  GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET
  ALLOWED_EMAILS         # comma-separated
  ```
- Migrations: run `drizzle-kit migrate` from your machine against prod for now.
  *shortcut: manual migrations; move into a CI step once others contribute.*
- Deploy previews: point them at a **Neon branch** (Neon GitHub integration) so previews never touch prod data.

---

## 8. Database (Neon) code

```ts
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
```

If you ever need multi-statement transactions, switch to `drizzle-orm/neon-serverless` with `Pool`.

---

## 9. Testing

- **Unit:** Vitest for `lib/issues.ts` (numbering, reference parsing like `"WEB-42"`, validation) against a Neon test branch.
- **MCP:** a script that calls each tool via the MCP SDK client against a preview deploy.
- **E2E (optional):** one Playwright happy path — login, create issue, move it to done.

---

## 10. Risks & gotchas

| Risk | Mitigation |
|---|---|
| Netlify function timeout (~10s default) | Keep requests short; no long streaming |
| Edge middleware can't use Node APIs/DB | Only check the session cookie there |
| MCP OAuth spec churn | API keys first; OAuth last, with fresh docs |
| Anyone with a GitHub account signs in | Email allowlist |
| Leaked API key = full access | Hash keys, allow revoke, show once |
| Cold starts on the free tier | Acceptable for a personal app |
| Prompt injection via issue text read by Claude | Treat as data; Claude asks before destructive actions (no delete tool in v1) |

---

## 11. Before you start — verify

- Current Netlify function timeout and free-tier limits.
- Better Auth's current plugin names for API keys and MCP/OAuth provider.
- `mcp-handler` current API (`createMcpHandler`, auth wrapper).
- Neon free-tier limits (storage, compute hours).
