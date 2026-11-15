# Homepage Build Plan: Linear Lite

A public landing page for logged-out visitors. One page, one scroll, one call to action.
"Linear Lite" is a placeholder name: keep it in one constant so renaming is a one-line change.

---

## 1. Message

| | |
|---|---|
| **Headline** | Linear without all the noise. |
| **Subhead** | Projects and issues. That's it. |
| **Proof points** | Single GitHub sign-in · MCP enabled · List or board |
| **Call to action** | Continue with GitHub |

Every section below backs up one of these lines. If a section doesn't, cut it.

---

## 2. What to borrow from linear.app

Borrow the feel. Don't copy its copy, layout pixel for pixel, or brand.

- **Dark-first, quiet palette.** Near-black background, soft gray text, one accent used sparingly.
- **Big, tight headline.** Large type, tight letter spacing, short lines. The headline does the selling.
- **Product as hero.** A real screenshot of the app, large, just below the fold line, slightly tilted or fading at the bottom edge.
- **Sparse sections.** Lots of whitespace, one idea per section, short paragraphs.
- **Subtle motion only.** Fade/slide-in on scroll. Nothing that moves on its own.

**Not borrowed:** Linear's purple/indigo gradients. The accent stays neutral or blue-green (project rule: no purple). No customer logo wall, no pricing table, no changelog.

---

## 3. Page structure

1. **Nav bar** (sticky, translucent)
   - Left: logo + name. Right: "GitHub" (repo link) and "Sign in".
2. **Hero**
   - Headline, subhead, primary button "Continue with GitHub", secondary link "View the code".
   - Below: large screenshot of the board view, dark theme.
3. **"That's it" strip**
   - Two columns: **In** (projects, issues, markdown descriptions, list + board) vs **Out** (cycles, labels, teams, notifications, roadmaps).
   - The "out" list is the joke and the pitch: struck through or dimmed.
4. **Feature trio** (three cards)
   - **Projects and issues.** Title, markdown description, status. Nothing else to configure.
   - **One sign-in.** GitHub only. No passwords, no invites, no SSO setup.
   - **List or board.** Group by status, or drag across columns. (The app has no keyboard shortcuts or ⌘K yet, so the page doesn't claim them.)
5. **MCP section** (the differentiator, gets its own band)
   - Short line: "Let Claude manage your issues."
   - Left: the one-line `claude mcp add …` command in a code block with a copy button.
   - Right: a mock chat: "create an issue in WEB for the login bug" → the new issue card appears.
   - List the tools: create, update, list, get, delete issues; list and create projects.
6. **Final call to action**
   - Repeat the headline in smaller type + "Continue with GitHub".
7. **Footer**
   - Name, GitHub link, "Built with Next.js, Neon, Better Auth". One line.

---

## 4. Visual design

- **Theme:** dark by default on this page, regardless of the app's theme toggle. Reuse the app's existing tokens in `globals.css`; add only what the page needs.
- **Type:** the app's existing font. Headline ~56–72px desktop / ~36–40px mobile, tight tracking.
- **Width:** content max ~1100px, centered, 16px gutters on mobile.
- **Screenshots:** real ones taken from the live app (board + issue page), saved as optimized images in `public/`. Retake when the UI changes.
- **Mobile:** single column; screenshot scales down; nav collapses to logo + "Sign in".

---

## 5. Routing (the tricky part)

Today `/` is the signed-in app home, and the proxy sends anyone without a session cookie to `/login`.

**Plan:** the proxy **rewrites** `/` to a new static `/welcome` route when there's no session cookie.
- Still cookie-only, so it keeps the rule "middleware only checks the session cookie, no DB calls".
- Signed-in users at `/` see the app as before. Visitors see the landing page at the same URL.
- `/welcome` is fully static: no DB, no session check, fast.
- Add `welcome` to the proxy's allowed paths; keep `/login` as is (the CTA can call the same GitHub sign-in).

---

## 6. Build steps (one card each)

1. **Route + skeleton.** Proxy rewrite, `/welcome` page with nav, hero text and footer. No styling polish.
2. **Hero + screenshot.** Final headline styling, buttons wired to GitHub sign-in, board screenshot.
3. **"That's it" strip + feature trio.**
4. **MCP section.** Command block with copy button, mock chat, tool list.
5. **Polish.** Scroll fade-ins, mobile pass, metadata (title, description, Open Graph image), Lighthouse check.

**Done when:** a logged-out visitor at the live URL sees the page, it scores 90+ on Lighthouse performance, and "Continue with GitHub" signs an allowed user into the app.

---

## 7. Out of scope

Pricing, docs, blog, changelog, customer logos, newsletter signup, analytics, separate marketing site.

---

## 8. Open questions

- **Final name and logo**, before step 5 (Open Graph image uses them).
- **Accent color** (anything but purple).
