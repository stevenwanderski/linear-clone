"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { updateIssueAction } from "@/actions/issues";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { priorityLabels, statusLabels } from "@/lib/labels";

type Changes = Parameters<typeof updateIssueAction>[1];

const statusItems = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));
const priorityItems = priorityLabels.map((label, value) => ({ value, label }));

// `showNow` displays the change before the server answers. When the save finishes, React drops it and
// shows the real props again: the new value after a refresh, or the old one if the save failed.
function useSave(issueRef: string, showNow?: (changes: Changes) => void) {
  const [pending, startTransition] = useTransition();
  const save = (changes: Changes, onFail?: () => void) =>
    startTransition(async () => {
      showNow?.(changes);
      try {
        await updateIssueAction(issueRef, changes);
      } catch {
        onFail?.();
        toast.error("Couldn't save that change. Try again.");
      }
    });
  return { pending, save };
}

// Saves on Enter or when the field loses focus. Escape or an empty title puts the old one back.
export function IssueTitle({ issueRef, title }: { issueRef: string; title: string }) {
  const { save } = useSave(issueRef);
  return (
    <Input
      aria-label="Title"
      defaultValue={title}
      className="mb-4 h-auto border-none px-0 text-xl font-semibold shadow-none focus-visible:ring-0 md:text-xl dark:bg-transparent"
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          e.currentTarget.value = title;
          e.currentTarget.blur();
        }
      }}
      onBlur={(e) => {
        const input = e.currentTarget;
        const value = input.value.trim();
        if (!value) input.value = title;
        else if (value !== title) save({ title: value }, () => (input.value = title)); // roll back on failure
      }}
    />
  );
}

export function IssueFields(props: {
  issueRef: string;
  status: string;
  priority: number;
  assigneeId: string | null;
  users: { id: string; name: string }[];
}) {
  const [shown, showNow] = useOptimistic(
    { status: props.status, priority: props.priority, assigneeId: props.assigneeId },
    (current, changes: Changes) => ({ ...current, ...changes }),
  );
  const { pending, save } = useSave(props.issueRef, showNow);
  const userItems = [{ value: null, label: "Unassigned" }, ...props.users.map((u) => ({ value: u.id, label: u.name }))];

  return (
    <dl className="grid w-64 shrink-0 grid-cols-[auto_1fr] content-start items-center gap-x-4 gap-y-2 text-sm" aria-busy={pending}>
      <dt className="text-muted-foreground">Status</dt>
      <dd>
        <Select items={statusItems} value={shown.status} onValueChange={(status) => status && save({ status: status as Changes["status"] })}>
          <SelectTrigger size="sm" className="w-full" aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </dd>
      <dt className="text-muted-foreground">Priority</dt>
      <dd>
        <Select items={priorityItems} value={shown.priority} onValueChange={(priority) => priority !== null && save({ priority })}>
          <SelectTrigger size="sm" className="w-full" aria-label="Priority"><SelectValue /></SelectTrigger>
          <SelectContent>
            {priorityItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </dd>
      <dt className="text-muted-foreground">Assignee</dt>
      <dd>
        <Select items={userItems} value={shown.assigneeId} onValueChange={(assigneeId) => save({ assigneeId })}>
          <SelectTrigger size="sm" className="w-full" aria-label="Assignee"><SelectValue /></SelectTrigger>
          <SelectContent>
            {userItems.map((item) => <SelectItem key={item.value ?? "none"} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </dd>
    </dl>
  );
}
