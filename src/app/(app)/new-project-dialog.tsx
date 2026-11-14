"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Closes as soon as you submit: the parent shows the project right away and reports any error as a toast.
export function NewProjectDialog({ onCreate }: { onCreate: (name: string, key: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-xs" aria-label="New project" />}>+</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form
          // Closing here, not in the action: state set inside an action waits until the action finishes.
          onSubmit={() => setOpen(false)}
          action={async (formData) => {
            await onCreate(String(formData.get("name")), String(formData.get("key")));
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
          <DialogFooter>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
