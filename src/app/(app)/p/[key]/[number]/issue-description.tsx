"use client";

import { useOptimistic, useState, useTransition } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { updateIssueAction } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Flips the first "[ ]" / "[x]" at or after `offset` (the start of a task list item).
export function toggleTask(text: string, offset: number) {
  const m = /\[[ xX]\]/.exec(text.slice(offset));
  if (!m) return text;
  const at = offset + m.index;
  return text.slice(0, at) + (m[0] === "[ ]" ? "[x]" : "[ ]") + text.slice(at + 3);
}

// react-markdown ignores raw HTML by default, so a description can't inject scripts.
function Preview({ text, onToggle }: { text: string; onToggle?: (offset: number) => void }) {
  if (!text.trim()) return <p className="text-sm text-muted-foreground">No description</p>;
  return (
    <div className="prose prose-sm text-[15px]! max-w-none dark:prose-invert">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // The checkbox has no source position, so its list item handles the (bubbled) change.
          li: ({ node, ...props }) => {
            const offset = node?.position?.start.offset;
            const task = onToggle && offset !== undefined && props.className?.includes("task-list-item");
            return (
              <li
                {...props}
                onChange={task ? (e) => { e.stopPropagation(); onToggle(offset); } : undefined}
              />
            );
          },
          input: ({ node, ...props }) => <input {...props} disabled={!onToggle} readOnly className="cursor-pointer disabled:cursor-default" />,
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}

export function IssueDescription({ issueRef, description }: { issueRef: string; description: string }) {
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(description);

  if (draft === null) {
    const toggle = (offset: number) =>
      startTransition(async () => {
        const next = toggleTask(shown, offset);
        setShown(next);
        try {
          await updateIssueAction(issueRef, { description: next });
        } catch {
          toast.error("Couldn't update the checkbox. Try again.");
        }
      });
    return (
      <div>
        <Preview text={shown} onToggle={toggle} />
        <Button variant="link" size="sm" className="mt-2 h-auto px-0 text-muted-foreground" onClick={() => setDraft(description)}>
          Edit description
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <Textarea
        aria-label="Description"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a description… (markdown works)"
        className="min-h-40 font-mono text-sm"
        autoFocus
      />
      <div className="rounded-md border p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
        <Preview text={draft} />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateIssueAction(issueRef, { description: draft });
                setDraft(null);
              } catch {
                toast.error("Couldn't save the description. Try again."); // the draft stays open, so nothing is lost
              }
            })
          }
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setDraft(null)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
