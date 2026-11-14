"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Closes as soon as you submit: the parent shows the issue right away and reports any error as a toast.
export function NewIssueDialog({ projectKey, onCreate }: { projectKey: string; onCreate: (title: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>New issue</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New issue in {projectKey}</DialogTitle>
        </DialogHeader>
        <form
          // Closing here, not in the action: state set inside an action waits until the action finishes.
          onSubmit={() => setOpen(false)}
          action={async (formData) => {
            await onCreate(String(formData.get("title")).trim());
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Issue title" required maxLength={200} autoFocus />
          </div>
          <DialogFooter>
            <Button type="submit">Create issue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
