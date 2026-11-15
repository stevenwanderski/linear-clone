"use client";

import { useState, useTransition } from "react";
import { PencilIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteProjectAction, updateProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/color-picker";

type Project = { key: string; name: string; color: string | null };

// Rename a project or change its color. The key is shown but can't change: it's part of every issue ref and URL.
// "Delete project" swaps the form for a warning, so deleting always takes a second, deliberate click.
export function EditProjectDialog({ project, issueCount }: { project: Project; issueCount: number }) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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

  // On success the action redirects home. No try/catch here: Next.js signals that redirect by throwing,
  // and catching it would show an error toast for a delete that worked.
  function remove() {
    startTransition(async () => {
      const { error } = await deleteProjectAction(project.key);
      if (error) toast.error(error);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmingDelete(false); // reopening starts at the form again
      }}
    >
      {/* Hidden until you hover the title; stays visible while focused by keyboard or while the dialog is open. */}
      <DialogTrigger
        render={<Button variant="ghost" size="icon-xs" aria-label="Edit project" />}
        className="opacity-0 group-hover/title:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent>
        {confirmingDelete ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete this project?</DialogTitle>
              <DialogDescription className="sr-only">This permanently deletes the project and its issues.</DialogDescription>
            </DialogHeader>
            <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <p>
                This permanently deletes <span className="font-medium">{project.name}</span> ({project.key}) and{" "}
                <span className="font-medium">
                  {issueCount === 1 ? "its 1 issue" : `all ${issueCount} of its issues`}
                </span>
                . This can&apos;t be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmingDelete(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={remove} disabled={pending}>
                {pending ? "Deleting…" : "Delete project"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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
              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
                  Delete project
                </Button>
                <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
