"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteIssueAction } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Asks first, since a delete can't be undone. Afterwards goes back to the project, replacing the
// issue's URL in history so Back doesn't land on a 404.
export function DeleteIssueDialog({ issueRef, projectKey }: { issueRef: string; projectKey: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      try {
        await deleteIssueAction(issueRef);
      } catch {
        return void toast.error("Couldn't delete the issue. Try again.");
      }
      router.replace(`/p/${projectKey}`);
    });
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" />}>
        <Trash2Icon />
        Delete issue
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {issueRef}?</DialogTitle>
          <DialogDescription>This can&apos;t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={remove} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
