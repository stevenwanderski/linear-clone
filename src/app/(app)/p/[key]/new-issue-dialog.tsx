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
export function NewIssueDialog({
  projectKey,
  onCreate,
  status,
}: {
  projectKey: string;
  onCreate: (issue: NewIssue) => Promise<void>;
  status?: NewIssue["status"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {status ? (
        <DialogTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`New issue in ${statusLabels[status]}`} />}>
          <PlusIcon />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>New issue</DialogTrigger>
      )}
      <DialogContent>
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
            <Textarea id="description" name="description" placeholder="Markdown, optional" rows={5} />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select name="status" items={statusItems} defaultValue={status ?? "backlog"}>
              <SelectTrigger aria-label="Status" className="w-full"><SelectValue /></SelectTrigger>
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
