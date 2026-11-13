"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { createProjectAction, type CreateProjectState } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-xs" aria-label="New project" />}>+</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <NewProjectForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

// Lives inside DialogContent, which unmounts on close, so errors reset each time the dialog opens.
function NewProjectForm({ onCreated }: { onCreated: () => void }) {
  const [state, formAction, pending] = useActionState(async (prev: CreateProjectState, formData: FormData) => {
    try {
      const result = await createProjectAction(prev, formData);
      if (result.ok) onCreated();
      return result;
    } catch {
      toast.error("Couldn't create the project. Try again.");
      return { values: { name: String(formData.get("name") ?? ""), key: String(formData.get("key") ?? "") } };
    }
  }, {});

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Website" defaultValue={state.values?.name} required autoFocus />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="key">Key</Label>
        <Input id="key" name="key" placeholder="WEB" defaultValue={state.values?.key} required maxLength={10} className="uppercase" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create project"}</Button>
      </DialogFooter>
    </form>
  );
}
