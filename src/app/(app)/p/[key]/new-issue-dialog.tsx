"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { statusLabels } from "@/lib/labels";
import { statusItems } from "./[number]/issue-fields";
import type { NewIssue } from "./issue-list";

// Closes as soon as you submit: the parent shows the issue right away and reports any error as a toast.
// With `status` (a board column), the trigger is a small + and the status starts on that column.
// With `label`, the trigger is a full-size button with that text (the empty project placeholder).
export function NewIssueDialog({
  projectKey,
  onCreate,
  status,
  label,
}: {
  projectKey: string;
  onCreate: (issue: NewIssue) => Promise<void>;
  status?: NewIssue["status"];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {status ? (
        <DialogTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`New issue in ${statusLabels[status]}`} />}>
          <PlusIcon />
        </DialogTrigger>
      ) : label ? (
        <DialogTrigger render={<Button />}>{label}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>New issue</DialogTrigger>
      )}
      {/* Wide, so the description has room for real writing. */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New issue in {projectKey}</DialogTitle>
        </DialogHeader>
        <form
          // Closing here, not in the action: state set inside an action waits until the action finishes.
          onSubmit={() => setOpen(false)}
          action={async (formData) => {
            await onCreate({
              title: String(formData.get("title")).trim(),
              description: String(formData.get("description")),
              status: String(formData.get("status")) as NewIssue["status"],
            });
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Issue title" required maxLength={200} autoFocus autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Markdown, optional" className="min-h-64 max-h-[50vh] overflow-y-auto" />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select name="status" items={statusItems} defaultValue={status ?? "backlog"}>
              <SelectTrigger aria-label="Status" className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create issue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
