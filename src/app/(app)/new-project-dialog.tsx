"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/color-picker";

// Closes as soon as you submit: the parent shows the project right away and reports any error as a toast.
// Opens from the sidebar's small +, or from a full button when given a `label`.
export function NewProjectDialog({
  onCreate,
  label,
}: {
  onCreate: (project: { name: string; key: string; color?: string }) => Promise<void>;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {label ? (
        <DialogTrigger render={<Button />}>{label}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="ghost" size="icon-xs" aria-label="New project" />}>+</DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form
          // Closing here, not in the action: state set inside an action waits until the action finishes.
          onSubmit={() => setOpen(false)}
          action={async (formData) => {
            await onCreate({
              name: String(formData.get("name")),
              key: String(formData.get("key")),
              color: formData.get("color") ? String(formData.get("color")) : undefined,
            });
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Website" required maxLength={100} autoFocus autoComplete="off" data-1p-ignore />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key">Key</Label>
            {/* Same rule as the server, checked here too so most mistakes never leave the dialog. */}
            <Input
              id="key"
              name="key"
              placeholder="WEB"
              required
              pattern="[A-Za-z][A-Za-z0-9]{1,9}"
              title="2-10 letters or digits, starting with a letter"
              className="uppercase"
            />
          </div>
          <ColorPicker />
          <DialogFooter>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
