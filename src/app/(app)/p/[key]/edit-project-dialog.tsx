"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { updateProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/color-picker";

// Rename a project or change its color. The key is shown but can't change: it's part of every issue ref and URL.
export function EditProjectDialog({ project }: { project: { key: string; name: string; color: string | null } }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    startTransition(async () => {
      try {
        const { error } = await updateProjectAction(project.key, {
          name: String(formData.get("name")),
          color: formData.get("color") ? String(formData.get("color")) : undefined,
        });
        if (error) return void toast.error(error);
        setOpen(false);
      } catch {
        toast.error("Couldn't save the project. Try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Hidden until you hover the title; stays visible while focused by keyboard or while the dialog is open. */}
      <DialogTrigger
        render={<Button variant="ghost" size="icon-xs" aria-label="Edit project" />}
        className="opacity-0 group-hover/title:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>
        <form action={save} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" name="name" defaultValue={project.name} required maxLength={100} autoFocus autoComplete="off" data-1p-ignore />
          </div>
          <ColorPicker defaultValue={project.color} />
          <div className="grid gap-2">
            <Label htmlFor="project-key">Key</Label>
            <Input id="project-key" value={project.key} disabled />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
