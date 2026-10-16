"use client";

import { XIcon } from "lucide-react";
import { Dialog as DrawerPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/cn.js";
import { useUI } from "../provider/UIProvider.js";
import { overlayClassName } from "./Dialog.js";

export function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

export function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

export function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

const SIDE = {
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:animate-cui-slide-in-right sm:max-w-sm",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:animate-cui-slide-in-left sm:max-w-sm",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] border-t data-[state=open]:animate-cui-slide-in-bottom",
} as const;

/**
 * A modal panel from an edge: secondary content that should not cost a page
 * (a detail sheet, a filter set), and the shell's rails on narrow screens.
 * The Astrolift UI calls it a sheet.
 */
export function DrawerContent({
  className,
  children,
  side = "right",
  hideCloseButton = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  side?: keyof typeof SIDE;
  hideCloseButton?: boolean;
}) {
  const { messages } = useUI();
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={overlayClassName()} />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto border-border bg-background text-sm text-foreground shadow-lg outline-none",
          SIDE[side],
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DrawerPrimitive.Close
            data-slot="drawer-close-button"
            aria-label={messages.dialog.close}
            className="absolute top-3 right-3 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <XIcon className="size-4" aria-hidden />
          </DrawerPrimitive.Close>
        )}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

export function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1 p-4 pr-10", className)}
      {...props}
    />
  );
}

export function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-head text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
