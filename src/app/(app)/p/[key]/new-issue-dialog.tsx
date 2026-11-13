"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { createIssueAction, type CreateIssueState } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewIssueDialog({ projectKey }: { projectKey: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>New issue</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New issue in {projectKey}</DialogTitle>
        </DialogHeader>
        <NewIssueForm projectKey={projectKey} onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

// Lives inside DialogContent, which unmounts on close, so errors reset each time the dialog opens.
function NewIssueForm({ projectKey, onCreated }: { projectKey: string; onCreated: () => void }) {
  const [state, formAction, pending] = useActionState(async (prev: CreateIssueState, formData: FormData) => {
    try {
      const result = await createIssueAction(projectKey, prev, formData);
      if (result.ok) onCreated();
      return result;
    } catch {
      toast.error("Couldn't create the issue. Try again.");
      return { values: { title: String(formData.get("title") ?? "") } };
    }
  }, {});

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Issue title" defaultValue={state.values?.title} required autoFocus />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create issue"}</Button>
      </DialogFooter>
    </form>
  );
}
