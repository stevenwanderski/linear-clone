"use client";

import { useState, useTransition } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { updateIssueAction } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// react-markdown ignores raw HTML by default, so a description can't inject scripts.
function Preview({ text }: { text: string }) {
  if (!text.trim()) return <p className="text-sm text-muted-foreground">No description</p>;
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <Markdown>{text}</Markdown>
    </div>
  );
}

export function IssueDescription({ issueRef, description }: { issueRef: string; description: string }) {
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const [pending, startTransition] = useTransition();

  if (draft === null) {
    return (
      <div>
        <Preview text={description} />
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
