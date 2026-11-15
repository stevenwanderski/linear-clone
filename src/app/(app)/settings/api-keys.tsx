"use client";

import { useState, useTransition } from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { createApiKeyAction, revokeApiKeyAction } from "@/actions/api-keys";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Key = { id: string; name: string; start: string | null; created: string; expires: string | null };

export function ApiKeys({ keys }: { keys: Key[] }) {
  // The full key of the one just created. It lives only in this state: reload the page and it's gone.
  const [newKey, setNewKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function create(formData: FormData) {
    startTransition(async () => {
      try {
        const { key, error } = await createApiKeyAction(String(formData.get("name")));
        if (error) return void toast.error(error);
        setNewKey(key ?? null);
      } catch {
        toast.error("Couldn't create the key. Try again.");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <form action={create} className="flex items-end gap-2">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="key-name">New key name</Label>
          <Input id="key-name" name="name" placeholder="Claude Code on my laptop" required maxLength={32} autoComplete="off" data-1p-ignore />
        </div>
        <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create key"}</Button>
      </form>

      {newKey && <NewKey value={newKey} onDone={() => setNewKey(null)} />}

      {keys.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-[13px] text-muted-foreground">No API keys yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
              <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="grid min-w-0 flex-1">
                <span className="truncate font-medium">{key.name}</span>
                <span className="text-xs text-muted-foreground">
                  <code>{key.start}…</code> · Created {key.created} · {key.expires ? `Expires ${key.expires}` : "Never expires"}
                </span>
              </div>
              <RevokeButton keyId={key.id} name={key.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewKey({ value, onDone }: { value: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy. Select the key and copy it yourself.");
    }
  }
  return (
    <div role="status" className="grid gap-2 rounded-lg border bg-muted/50 p-4 text-[13px]">
      <p className="font-medium">Copy your new key now. You won&apos;t be able to see it again.</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border bg-background px-2 py-1.5 font-mono text-xs select-all">{value}</code>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Button type="button" variant="link" size="sm" className="justify-self-start px-0 text-muted-foreground" onClick={onDone}>
        I&apos;ve saved it
      </Button>
    </div>
  );
}

function RevokeButton({ keyId, name }: { keyId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function revoke() {
    startTransition(async () => {
      try {
        await revokeApiKeyAction(keyId);
        setOpen(false);
        toast.success(`Revoked “${name}”`);
      } catch {
        toast.error("Couldn't revoke the key. Try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}>Revoke</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke “{name}”?</DialogTitle>
          <DialogDescription>Anything using this key stops working right away. This can&apos;t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={revoke} disabled={pending}>{pending ? "Revoking…" : "Revoke key"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
