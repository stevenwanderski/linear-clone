"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = { href: string; children: React.ReactNode };

// A sidebar link that highlights while you're on its page or any page under it.
// The current URL is request-time data, so the highlight streams in behind Suspense; until then it's a plain link.
export function NavLink(props: Props) {
  return (
    <Suspense fallback={<StyledLink {...props} active={false} />}>
      <ActiveNavLink {...props} />
    </Suspense>
  );
}

function ActiveNavLink(props: Props) {
  const pathname = usePathname();
  const active = pathname === props.href || pathname.startsWith(`${props.href}/`);
  return <StyledLink {...props} active={active} />;
}

function StyledLink({ href, children, active }: Props & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-7 items-center gap-2 rounded-md px-2 text-[13px] text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        active && "bg-sidebar-accent font-medium text-sidebar-foreground",
      )}
    >
      {children}
    </Link>
  );
}
