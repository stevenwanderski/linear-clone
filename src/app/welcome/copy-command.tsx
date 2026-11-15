"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// A shell command in a code block, with a button that copies it.
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-xl border border-border/60 bg-card/60">
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </pre>
      <Button variant="ghost" size="icon-sm" onClick={copy} className="absolute top-2.5 right-2.5" aria-label={copied ? "Copied" : "Copy command"}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  );
}
