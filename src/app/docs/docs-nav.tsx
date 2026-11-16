"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type NavSection = { id: string; title: string; group: string; subs: { id: string; title: string }[] };

// Tracks which section and subsection sit in the band just under the sticky header.
// Takes the ids as one space-separated string, so the effect only reruns when they actually change.
function useActive(idList: string) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-64px 0px -70% 0px" },
    );
    for (const id of idList.split(" ")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [idList]);
  return active;
}

const link = "block py-1 text-[13px] transition-colors hover:text-foreground";

// Left column: every section, grouped. Highlights the one you're reading.
export function DocsSidebar({ sections }: { sections: NavSection[] }) {
  const active = useActive(sections.map((s) => s.id).join(" "));
  const groups = [...new Set(sections.map((s) => s.group))];
  return (
    <nav aria-label="Docs" className="space-y-6">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-2 text-xs font-medium text-foreground">{group}</p>
          <ul className="space-y-0.5 border-l border-border/60">
            {sections
              .filter((s) => s.group === group)
              .map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "location" : undefined}
                    className={cn(
                      link,
                      "-ml-px border-l pl-3",
                      active === s.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground",
                    )}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// Right column: the subsections of every section, highlighting the one in view.
export function OnThisPage({ sections }: { sections: NavSection[] }) {
  const subs = sections.flatMap((s) => s.subs);
  const active = useActive(subs.map((s) => s.id).join(" "));
  const current = sections.find((s) => s.subs.some((sub) => sub.id === active)) ?? sections[0];
  return (
    <nav aria-label="On this page">
      <p className="mb-2 text-xs font-medium text-foreground">On this page</p>
      <ul className="space-y-0.5">
        {current.subs.map((sub) => (
          <li key={sub.id}>
            <a href={`#${sub.id}`} className={cn(link, active === sub.id ? "text-foreground" : "text-muted-foreground")}>
              {sub.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
