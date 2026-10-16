"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "../lib/cn.js";
import { Button } from "../primitives/Button.js";
import { useUI } from "../provider/UIProvider.js";
import { overlayClassName } from "./Dialog.js";

/** A required free-text reason, for actions the audit trail must explain. */
export interface ConfirmReason {
  label: React.ReactNode;
  placeholder?: string;
  /** Shown when the reason is empty. Defaults to "A reason is required." */
  requiredError?: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  /** Called on cancel, Escape, and after a confirmation that succeeded. Not called while one is pending. */
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** The blast radius: what changes, what is recoverable, who can undo it. */
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** The destructive treatment, for delete, revoke and abort. */
  destructive?: boolean;
  /** Hold the confirm button until required data is ready. */
  confirmDisabled?: boolean;
  /**
   * Awaited on confirm, with the trimmed reason ("" without one). While it is
   * pending both buttons are disabled. Resolving `false` keeps the dialog
   * open (the caller reported the failure); any other result closes it. A
   * rejection keeps it open and shows the error's message in the dialog.
   */
  onConfirm: (reason: string) => Promise<unknown> | unknown;
  reason?: ConfirmReason;
}

/**
 * The confirmation for destructive actions (Astrolift's ConfirmDialog, #2126):
 * a themed alert dialog with a pending state and real error feedback, in
 * place of `window.confirm`, which blocks the event loop and can say nothing
 * when the action fails.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  confirmDisabled = false,
  onConfirm,
  reason,
}: ConfirmDialogProps) {
  const { messages } = useUI();
  const t = messages.confirm;
  const [pending, setPending] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const reasonId = React.useId();
  const errorId = `${reasonId}-error`;

  // Cleared on every close, so the next open never shows a cancelled attempt.
  function close() {
    setDraft("");
    setError(null);
    onOpenChange(false);
  }

  async function confirm(event: React.MouseEvent) {
    // Radix closes on Action by default; hold it open while the action runs.
    event.preventDefault();
    if (pending || confirmDisabled) return;
    const trimmed = draft.trim();
    if (reason && !trimmed) {
      setError(reason.requiredError ?? t.reasonRequired);
      return;
    }
    setError(null);
    setPending(true);
    try {
      const result = await onConfirm(trimmed);
      if (result !== false) close();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : typeof err === "string" && err
            ? err
            : t.failed
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        // A stray Escape must not abandon a request in flight.
        if (pending && !next) return;
        if (next) onOpenChange(true);
        else close();
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          data-slot="confirm-dialog-overlay"
          className={overlayClassName()}
        />
        <AlertDialogPrimitive.Content
          data-slot="confirm-dialog"
          aria-busy={pending || undefined}
          // Without a description there is nothing to point at; saying so
          // explicitly keeps Radix from warning about a missing one.
          {...(description == null ? { "aria-describedby": undefined } : {})}
          className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg bg-popover p-5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-[state=open]:animate-cui-pop-in"
        >
          <div className="flex flex-col gap-1.5">
            <AlertDialogPrimitive.Title className="font-head text-base font-semibold [overflow-wrap:anywhere]">
              {title}
            </AlertDialogPrimitive.Title>
            {description != null && (
              <AlertDialogPrimitive.Description className="text-sm [overflow-wrap:anywhere] text-muted-foreground">
                {description}
              </AlertDialogPrimitive.Description>
            )}
          </div>
          {reason && (
            <div className="grid min-w-0 gap-1.5">
              <label htmlFor={reasonId} className="text-sm font-medium">
                {reason.label}
              </label>
              <textarea
                id={reasonId}
                value={draft}
                rows={4}
                disabled={pending}
                placeholder={reason.placeholder}
                aria-invalid={error != null || undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (error) setError(null);
                }}
                className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
              />
            </div>
          )}
          {error && (
            <p
              id={errorId}
              role="alert"
              className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm [overflow-wrap:anywhere] text-danger-fg"
            >
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                {cancelLabel ?? t.cancel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                variant={destructive ? "destructive" : "default"}
                disabled={pending || confirmDisabled}
                onClick={confirm}
                className={cn(pending && "cursor-progress")}
              >
                {pending ? t.working : (confirmLabel ?? t.confirm)}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
