"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-fetch the page's server data every few seconds, so changes from other tabs or from Claude (MCP) show up.
// shortcut: polling, not push; switch to a pub/sub service (Pusher/Ably) if changes need to be instant.
export function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
