import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDownIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { CopyCommand } from "@/components/copy-command";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { appName, mcpCommand, siteUrl } from "@/lib/brand";
import { projectColors, statusLabels } from "@/lib/labels";
import { DocsSidebar, OnThisPage, type NavSection } from "./docs-nav";

// No `title`: the root layout sets it (see the note there).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  description: `How to use ${appName}: projects, issues, list and board views, and connecting Claude Code over MCP.`,
};

// The section list drives both nav columns. Each id matches a <Section> or <Sub> below.
const sections: NavSection[] = [
  { id: "getting-started", title: "Getting started", group: "Basics", subs: [
    { id: "sign-in", title: "Sign in" },
    { id: "first-project", title: "Your first project" },
    { id: "first-issue", title: "Your first issue" },
  ] },
  { id: "projects", title: "Projects", group: "Basics", subs: [
    { id: "create-project", title: "Create a project" },
    { id: "edit-project", title: "Rename or recolor" },
    { id: "delete-project", title: "Delete a project" },
  ] },
  { id: "issues", title: "Issues", group: "Basics", subs: [
    { id: "create-issue", title: "Create an issue" },
    { id: "issue-refs", title: "Issue refs" },
    { id: "statuses", title: "Statuses" },
    { id: "edit-issue", title: "Edit an issue" },
    { id: "delete-issue", title: "Delete an issue" },
  ] },
  { id: "views", title: "Views", group: "Basics", subs: [
    { id: "open-issues", title: "Open issues" },
    { id: "list-view", title: "List view" },
    { id: "board-view", title: "Board view" },
  ] },
  { id: "connect-claude", title: "Connect Claude Code", group: "Claude", subs: [
    { id: "create-key", title: "Create an API key" },
    { id: "add-server", title: "Add the MCP server" },
    { id: "check-connection", title: "Check it works" },
    { id: "key-expiry", title: "Key expiry and revoking" },
  ] },
  { id: "using-claude", title: "Using Claude", group: "Claude", subs: [
    { id: "example-prompts", title: "Example prompts" },
    { id: "mcp-tools", title: "MCP tools" },
  ] },
  { id: "privacy", title: "Privacy and limits", group: "Reference", subs: [
    { id: "who-sees-what", title: "Who sees what" },
    { id: "limits", title: "What's left out" },
  ] },
  { id: "troubleshooting", title: "Troubleshooting", group: "Reference", subs: [
    { id: "key-stopped", title: "A key stopped working" },
    { id: "missing-project", title: "Claude can't find a project" },
    { id: "remove-server", title: "Remove the MCP server" },
  ] },
];

const tools = [
  { name: "list_projects", does: "Lists your projects and their keys." },
  { name: "create_project", does: "Creates a project from a key, a name and an optional color." },
  { name: "list_issues", does: "Lists issues. Filter by project, by status, or to open issues only." },
  { name: "get_issue", does: "Reads one issue by ref, including its description." },
  { name: "create_issue", does: "Creates an issue in a project, with an optional description and status." },
  { name: "update_issue", does: "Changes an issue's title, description or status." },
  { name: "delete_issue", does: "Permanently deletes an issue." },
];

const prompts = [
  "What's open in WEB?",
  "Create an issue in API for adding rate limits to the export endpoint",
  "Move WEB-3 to in progress",
  "Read APP-12 and fix it, then mark it done",
  "Turn these notes into issues in WEB: …",
  "Which issues across my projects are in progress?",
];

export default function DocsPage() {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto grid w-full max-w-[1100px] flex-1 gap-10 px-4 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_160px]">
        {/* Phones and tablets: the section list folds into a menu at the top. */}
        <details className="group mt-6 rounded-lg border border-border/60 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Sections
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border/60 px-4 py-4">
            <DocsSidebar sections={sections} />
          </div>
        </details>

        <aside className="hidden lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-10">
            <DocsSidebar sections={sections} />
          </div>
        </aside>

        <main className="min-w-0 py-10 text-[15px] leading-7 text-muted-foreground">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Docs</h1>
          <p className="mt-3 text-lg">
            Everything {appName} does, on one page. It&apos;s a short page, because {appName} doesn&apos;t do much on purpose.
          </p>

          <Section id="getting-started" title="Getting started">
            <Sub id="sign-in" title="Sign in">
              <p>
                <Link href="/login" className={a}>Sign in with GitHub</Link>. There&apos;s no password and no separate
                sign-up: your first sign-in creates your account.
              </p>
            </Sub>
            <Sub id="first-project" title="Your first project">
              <p>
                A new account opens on a welcome screen. Choose <B>Create your first project</B>, then give it a name and a
                short key, like <C>WEB</C> for a website.
              </p>
            </Sub>
            <Sub id="first-issue" title="Your first issue">
              <p>
                Inside the project, choose <B>Create the first issue</B> (or <B>New issue</B> once it has some). Give it a
                title, and optionally a description and a status. It becomes <C>WEB-1</C>.
              </p>
            </Sub>
          </Section>

          <Section id="projects" title="Projects">
            <p>A project is a home for related issues, like a website or an app. Each one has a name, a key and a color.</p>
            <Sub id="create-project" title="Create a project">
              <p>
                Use the <B>+</B> next to <B>Projects</B> in the sidebar. The key is 2–10 letters or digits, starting with a
                letter. It&apos;s stored in uppercase, and each of your projects needs a different one.
              </p>
              <Callout>
                The key can&apos;t be changed later: it&apos;s part of every issue ref and every issue URL, like{" "}
                <C>/p/WEB/42</C>.
              </Callout>
            </Sub>
            <Sub id="edit-project" title="Rename or recolor">
              <p>
                Open the project, hover its title, and choose the pencil icon. You can change the name and pick one of{" "}
                {Object.keys(projectColors).length} colors.
              </p>
            </Sub>
            <Sub id="delete-project" title="Delete a project">
              <p>
                In the same dialog, choose <B>Delete project</B>. A warning shows how many issues will go with it, and a
                second click deletes it.
              </p>
              <Callout warning>Deleting a project permanently deletes all of its issues. It can&apos;t be undone.</Callout>
            </Sub>
          </Section>

          <Section id="issues" title="Issues">
            <p>An issue is one piece of work: a bug, a feature, a task. It has a title, a markdown description and a status.</p>
            <Sub id="create-issue" title="Create an issue">
              <p>
                In a project, use <B>New issue</B> at the top right. On the board, the <B>+</B> at the top of a column
                creates an issue that starts in that column. New issues go to the bottom of their column.
              </p>
            </Sub>
            <Sub id="issue-refs" title="Issue refs">
              <p>
                Issues are numbered per project, so the 42nd issue in <C>WEB</C> is <C>WEB-42</C>. That ref is how you name
                an issue anywhere, including when talking to Claude. Numbers are never reused, even after a delete.
              </p>
            </Sub>
            <Sub id="statuses" title="Statuses">
              <p>Every issue is in one of five statuses. New issues start in Backlog.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <li key={value} className="flex items-baseline gap-2">
                    <span className="text-foreground">{label}</span>
                    <C>{value}</C>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Done and Canceled count as closed. Everything else is open. The code names on the right are what Claude
                uses.
              </p>
            </Sub>
            <Sub id="edit-issue" title="Edit an issue">
              <p>Open an issue by clicking it. On its page:</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>
                  <B>Title:</B> click it and type. Enter saves, Escape puts the old title back.
                </li>
                <li>
                  <B>Description:</B> choose <B>Edit description</B>, write markdown, then <B>Save</B>. Headings, lists,
                  links and code blocks all work. Raw HTML is ignored.
                </li>
                <li>
                  <B>Status:</B> pick a new one from the menu. It saves right away.
                </li>
              </ul>
            </Sub>
            <Sub id="delete-issue" title="Delete an issue">
              <p>
                On the issue&apos;s page, choose <B>Delete issue</B> and confirm. To close an issue but keep it, set its status
                to Canceled instead.
              </p>
            </Sub>
          </Section>

          <Section id="views" title="Views">
            <Sub id="open-issues" title="Open issues">
              <p>
                The home page lists open issues from all your projects, grouped by status, with each issue&apos;s project
                beside it. Click the {appName} logo to get back to it.
              </p>
            </Sub>
            <Sub id="list-view" title="List view">
              <p>A project&apos;s issues grouped by status, one row each. It&apos;s the default view.</p>
            </Sub>
            <Sub id="board-view" title="Board view">
              <p>
                Switch with <B>List</B> and <B>Board</B> at the top of a project. The board has a column per status: drag a
                card to change its status or its place in the column.
              </p>
              <Callout>
                From the keyboard, tab to a card, press Space to pick it up, use the arrow keys to move it, and press Space
                again to drop it.
              </Callout>
            </Sub>
          </Section>

          <Section id="connect-claude" title="Connect Claude Code">
            <p>
              {appName} runs an <B>MCP server</B>, a standard way for AI tools to use other apps. Once connected, Claude Code
              can read, create and update your issues.
            </p>
            <Sub id="create-key" title="Create an API key">
              <p>
                Open the menu under your name at the bottom left, choose <B>Settings</B>, name a key (like
                &quot;Laptop&quot;) and choose <B>Create key</B>.
              </p>
              <Callout warning>The key is shown once. Copy it right away; it can&apos;t be shown again.</Callout>
            </Sub>
            <Sub id="add-server" title="Add the MCP server">
              <p>Settings shows this command with your key already filled in. Run it in your terminal:</p>
              <div className="mt-4">
                <CopyCommand command={mcpCommand()} />
              </div>
              <p className="mt-4">
                Each key acts as you, so keep it out of shared files and repos. The command saves it in your own Claude Code
                settings.
              </p>
            </Sub>
            <Sub id="check-connection" title="Check it works">
              <p>
                Start Claude Code and run <C>/mcp</C>: <C>linear-lite</C> should show as connected. Then ask{" "}
                <C>list my projects</C>.
              </p>
            </Sub>
            <Sub id="key-expiry" title="Key expiry and revoking">
              <p>
                Keys expire 90 days after you create them. Settings shows each key&apos;s expiry date. Use <B>Revoke</B> to
                cut off a key you no longer use, or one that may have leaked. It stops working immediately.
              </p>
            </Sub>
          </Section>

          <Section id="using-claude" title="Using Claude">
            <Sub id="example-prompts" title="Example prompts">
              <p>Talk to Claude as you would to a teammate who has the tracker open. Use issue refs to be exact.</p>
              <ul className="mt-4 grid gap-2">
                {prompts.map((p) => (
                  <li key={p} className="rounded-lg border border-border/60 bg-card/60 px-4 py-2.5 font-mono text-[13px] text-foreground">
                    {p}
                  </li>
                ))}
              </ul>
            </Sub>
            <Sub id="mcp-tools" title="MCP tools">
              <p>Claude picks these tools on its own. They&apos;re listed so you know what it can and can&apos;t do.</p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead className="bg-card/60 text-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Tool</th>
                      <th className="px-4 py-2.5 font-medium">What it does</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((t) => (
                      <tr key={t.name} className="border-t border-border/60">
                        <td className="px-4 py-2.5 whitespace-nowrap"><C>{t.name}</C></td>
                        <td className="px-4 py-2.5">{t.does}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Callout>Claude can&apos;t rename or delete projects. Do that in the app.</Callout>
            </Sub>
          </Section>

          <Section id="privacy" title="Privacy and limits">
            <Sub id="who-sees-what" title="Who sees what">
              <p>
                Your projects and issues are visible only to you, in the app and through your API keys. Someone else&apos;s
                project can use the same key as yours; you&apos;ll never see each other&apos;s. API keys are stored hashed,
                so not even the database holds them in readable form.
              </p>
            </Sub>
            <Sub id="limits" title="What's left out">
              <p>
                There are no teams, sharing, labels, priorities, assignees, due dates, comments or notifications. That&apos;s
                the point: projects and issues, nothing else.
              </p>
            </Sub>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            <Sub id="key-stopped" title="A key stopped working">
              <p>
                It most likely expired or was revoked. Check Settings and create a new key. Then remove the old server
                (below) and run the setup command again with the new key.
              </p>
            </Sub>
            <Sub id="missing-project" title="Claude can't find a project">
              <p>
                Claude sees the projects of the account that created the key. Ask it to <C>list my projects</C> to check the
                keys, and use the exact key, like <C>WEB</C>.
              </p>
            </Sub>
            <Sub id="remove-server" title="Remove the MCP server">
              <p>Run this in your terminal, then revoke the key in Settings:</p>
              <div className="mt-4">
                <CopyCommand command="claude mcp remove linear-lite" />
              </div>
            </Sub>
          </Section>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-14 py-10">
            <OnThisPage sections={sections} />
          </div>
        </aside>
      </div>

      <SiteFooter />
    </div>
  );
}

const a = "text-foreground underline underline-offset-4 hover:text-foreground/80";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border/50 pt-10 mt-12">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        <a href={`#${id}`}>{title}</a>
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Sub({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 pt-6">
      <h3 className="mb-2 text-base font-semibold text-foreground">
        <a href={`#${id}`}>{title}</a>
      </h3>
      {children}
    </div>
  );
}

function Callout({ warning, children }: { warning?: boolean; children: React.ReactNode }) {
  const Icon = warning ? TriangleAlertIcon : InfoIcon;
  return (
    <div
      className={`mt-4 flex gap-3 rounded-lg border p-3 text-sm leading-6 ${
        warning ? "border-amber-500/40 bg-amber-500/10" : "border-border/60 bg-card/60"
      }`}
    >
      <Icon className={`mt-1 size-4 shrink-0 ${warning ? "text-amber-500" : "text-muted-foreground"}`} aria-hidden="true" />
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <span className="font-medium text-foreground">{children}</span>;
const C = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{children}</code>
);
