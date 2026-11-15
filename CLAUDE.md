# Linear Lite

A small Linear clone: projects + issues, keyboard-driven UI, and an MCP server so Claude can manage issues. Next.js on Netlify, Neon Postgres, Drizzle, Better Auth.

Repo: https://github.com/stevenwanderski/linear-clone (public, branch `main`). Never commit secrets or `.env*` files.
Live site: https://happy-linear.netlify.app (Netlify auto-deploys every push to `main`).

The full plan is in `BUILD_PLAN.md`. Read it when a card needs more detail.

@AGENTS.md

## How we work

The work is split into Linear cards (team "Happy Code", project "Linear", titled `01 · …` to `21 · …`). Linear is the source of truth for progress.

- **"next card"** means the lowest-numbered card in Todo. Read it with the Linear MCP before starting.
- Move the card to In Progress when you start.
- I'm learning: work in small steps, explain what each step does and why, and stop for my review before moving on.
- Don't commit until I've reviewed. Never add Claude attribution to commits.
- When I say the card is done, move it to Done. If we made a decision the code doesn't show, add one line to **Decisions** below.

## Rules

- `src/lib/issues.ts` is the only code that touches the database. Server actions and MCP tools both call it.
- Middleware only checks the session cookie. No DB calls there.
- Keep it simple. No features beyond the current card.

## Decisions

<!-- One line each: what we chose and why. -->
- Node 22 (`.nvmrc`), because the Better Auth CLI needs it. Netlify reads `.nvmrc` too.
- Dev server runs on port 3001 (`npm run dev`), because another project always uses 3000.
- Vitest tests cover only DB-free code (ref parsing, validation): there is no test database, only the live one.
- Local dev (`.env.local`) uses the live database on purpose. Anything created while testing shows on the live site.
- Claude Code's `linear-lite` MCP server is added at local scope (`claude mcp add -s local`), so the API key stays out of the repo.
- Open sign-up (no email allowlist): anyone with GitHub can sign in, and projects are scoped to their owner.
- No OAuth / claude.ai connectors (card 20 canceled): MCP auth is API keys only.
- Migrations are run by hand (`npm run db:migrate`), never by Netlify: migrate before pushing code that adds a column, push before migrating one that drops a column.
