# Linear-lite

A small Linear clone: projects + issues, keyboard-driven UI, and an MCP server so Claude can manage issues. Next.js on Netlify, Neon Postgres, Drizzle, Better Auth.

Repo: https://github.com/stevenwanderski/linear-clone (public, branch `main`). Never commit secrets or `.env*` files.

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
- Dev server runs on port 3001 (`npm run dev`), because another project always uses 3000.
