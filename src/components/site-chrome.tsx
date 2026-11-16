import Link from "next/link";
import { Logo } from "@/components/logo";
import { appName } from "@/lib/brand";

// Header and footer for the public pages (landing page and docs).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <Logo className="size-5" />
          {appName}
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">Docs</Link>
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
        <span>{appName}</span>
        <span>
          <Link href="/docs" className="hover:text-foreground">Docs</Link> · Built with Next.js, Neon, Better Auth
        </span>
      </div>
    </footer>
  );
}
