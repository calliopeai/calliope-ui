"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/cn.js";
import { useUI } from "../provider/UIProvider.js";

export function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/** The scrim behind a modal; shared with Drawer. */
export function overlayClassName(className?: string) {
  return cn(
    "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-cui-fade-in supports-backdrop-filter:backdrop-blur-xs",
    className
  );
}

/**
 * A centred modal on the raised surface. Focus moves in on open and back to
 * the trigger on close (Radix); Escape and the scrim close it.
 */
export function DialogContent({
  className,
  children,
  hideCloseButton = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { hideCloseButton?: boolean }) {
  const { messages } = useUI();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-slot="dialog-overlay" className={overlayClassName()} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 grid-cols-[minmax(0,1fr)] gap-4 overflow-y-auto rounded-lg bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-[state=open]:animate-cui-pop-in",
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            aria-label={messages.dialog.close}
            className="absolute top-3 right-3 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <XIcon className="size-4" aria-hidden />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-6", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-head text-lg font-semibold [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm [overflow-wrap:anywhere] text-muted-foreground", className)}
      {...props}
    />
  );
}
