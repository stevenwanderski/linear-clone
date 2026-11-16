import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BoxIcon, CheckIcon, Columns3Icon, KeyRoundIcon } from "lucide-react";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { Logo } from "@/components/logo";
import { CopyCommand } from "@/components/copy-command";
import { appName, mcpCommand, repoUrl, siteUrl } from "@/lib/brand";

// Five things in, a pile of things out: the imbalance is the point.
const kept = [
  { name: "Projects", detail: "A key, a name, a color." },
  { name: "Issues", detail: "Numbered per project, like WEB-42." },
  { name: "Status", detail: "Backlog to Done, five steps." },
  { name: "Markdown descriptions", detail: "Write it like a README." },
  { name: "List and board views", detail: "Grouped by status, drag to move." },
];
const cut = [
  "Cycles", "Initiatives", "Roadmaps", "Milestones", "Triage", "SLAs", "Labels", "Priorities",
  "Estimates", "Sub-issues", "Teams", "Custom views", "Insights", "Notifications", "Integrations", "Customer requests",
];

const features = [
  { Icon: BoxIcon, title: "Projects and issues", body: "Title, markdown description, status. Nothing else to configure." },
  { Icon: KeyRoundIcon, title: "One sign-in", body: "GitHub only. No passwords, no invites, no SSO setup." },
  { Icon: Columns3Icon, title: "List or board", body: "Group issues by status, or drag them across columns." },
];

const mcpTools = ["create_issue", "update_issue", "get_issue", "list_issues", "delete_issue", "list_projects", "create_project"];

// No `title`: the root layout sets it (see the note there).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  description: "Linear without all the noise. Projects and issues, GitHub sign-in, and an MCP server for Claude.",
  openGraph: { title: appName, description: "Linear without all the noise. Projects and issues. That's it." },
};

// The public landing page. The proxy shows it at "/" to anyone without a session cookie.
// Fully static (no DB, no session), and always dark, whatever the app's theme toggle says.
export default function WelcomePage() {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/70 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <Logo className="size-5" />
            {appName}
          </Link>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href={repoUrl} className="hover:text-foreground">GitHub</a>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* A faint light from above, so the hero isn't a flat black slab. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_65%)]" />
          <div className="relative mx-auto max-w-[1100px] px-4 pt-20 md:pt-32">
            <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tighter text-balance md:text-7xl">
              Linear without all the noise.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground md:text-xl">Projects and issues. That&apos;s it.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <GitHubSignInButton />
              <a href={repoUrl} className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                View the code
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
            {/* The real app, fading out at the bottom edge. Retake public/board.png when the UI changes. */}
            <div className="mt-14 mask-b-from-60% md:mt-20">
              <Image
                src="/board.png"
                alt={`The ${appName} list view: a Website project's issues grouped under Backlog, Todo, In Progress and Done`}
                width={2160}
                height={1280}
                preload
                className="rounded-xl border border-border/60 shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* What's in, and the much longer list of what isn't, side by side in one panel. */}
        <section className="fade-in-view mx-auto max-w-[1100px] px-4 py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">That&apos;s it. Really.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">Everything {appName} does fits on one hand. Everything it skips doesn&apos;t.</p>
          <div className="mt-10 grid overflow-hidden rounded-2xl border border-border/60 bg-card/40 md:grid-cols-[2fr_3fr]">
            <div className="p-6 md:p-8">
              {/* The counts are the headline of each side: a big number, then what it counts. */}
              <h3 className="flex items-baseline gap-3">
                <span className="text-7xl font-semibold tracking-tighter tabular-nums">{kept.length}</span>
                <span className="text-sm font-medium text-muted-foreground">things in</span>
              </h3>
              <ul className="mt-8 grid gap-5">
                {kept.map(({ name, detail }) => (
                  <li key={name} className="flex gap-3">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col border-t border-border/60 bg-background/40 p-6 md:border-t-0 md:border-l md:p-8">
              <h3 className="flex items-baseline gap-3">
                <span className="text-7xl font-semibold tracking-tighter text-muted-foreground/70 tabular-nums">{cut.length}</span>
                <span className="text-sm font-medium text-muted-foreground">things out</span>
              </h3>
              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Not included">
                {cut.map((item) => (
                  <li key={item} className="rounded-md border border-border/50 px-3 py-1.5 text-sm text-muted-foreground line-through decoration-muted-foreground/60">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-10 border-t border-border/50 pt-5 text-sm text-muted-foreground md:mt-auto">
                And every setting, notification and meeting that comes with them.
              </p>
            </div>
          </div>
        </section>

        <section className="fade-in-view mx-auto grid max-w-[1100px] gap-4 px-4 pb-24 md:grid-cols-3">
          {features.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border/60 bg-card/40 p-6">
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        {/* MCP: the one thing Linear doesn't do. Its own band, set off by a slightly lighter background. */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="fade-in-view mx-auto max-w-[1100px] px-4 py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">MCP enabled</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Let Claude manage your issues.</h2>
              <p className="mt-4 text-muted-foreground">
                Make an API key in Settings, then add the server to Claude Code with one command.
              </p>
              <div className="mt-6">
                <CopyCommand command={mcpCommand()} />
              </div>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="MCP tools">
                {mcpTools.map((tool) => (
                  <li key={tool} className="rounded-md border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground">{tool}</li>
                ))}
              </ul>
            </div>

          </div>
        </section>
      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
          <span>{appName}</span>
          <span>Built with Next.js, Neon, Better Auth · <a href={repoUrl} className="hover:text-foreground">GitHub</a></span>
        </div>
      </footer>
    </div>
  );
}
