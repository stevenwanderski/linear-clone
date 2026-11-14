"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { updateIssueAction } from "@/actions/issues";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusIcon } from "@/components/issue-icons";
import { statusLabels } from "@/lib/labels";

type Changes = Parameters<typeof updateIssueAction>[1];

const withIcon = (icon: React.ReactNode, label: string) => (
  <span className="flex items-center gap-2">
    {icon}
    {label}
  </span>
);
const statusItems = (Object.entries(statusLabels) as [Changes["status"] & string, string][]).map(([value, label]) => ({
  value,
  label: withIcon(<StatusIcon status={value} />, label),
}));
// Borderless triggers, like Linear's property panel.
const trigger = "w-full border-none bg-transparent shadow-none hover:bg-muted dark:bg-transparent dark:hover:bg-muted";

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
      className="mb-4 h-auto border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 md:text-2xl dark:bg-transparent"
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
}) {
  const [shown, showNow] = useOptimistic(
    { status: props.status },
    (current, changes: Changes) => ({ ...current, ...changes }),
  );
  const { pending, save } = useSave(props.issueRef, showNow);

  return (
    <dl className="grid grid-cols-[4.5rem_1fr] items-center gap-x-2 gap-y-1 text-[13px]" aria-busy={pending}>
      <dt className="px-2 text-muted-foreground">Status</dt>
      <dd>
        <Select items={statusItems} value={shown.status} onValueChange={(status) => status && save({ status: status as Changes["status"] })}>
          <SelectTrigger size="sm" className={trigger} aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </dd>
    </dl>
  );
}
