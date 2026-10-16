"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/cn.js";

/**
 * In-page tabs: panels on one URL, with the ARIA tablist pattern (arrow keys
 * move between tabs). Tabs that are pages (an entity's Overview, Logs,
 * Settings) are links: use TabNav. The underline matches TabNav's, so the two
 * read as one family.
 */
export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    />
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex min-w-0 gap-1 overflow-x-auto border-b border-border", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative shrink-0 px-3 py-2.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-1 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-full data-[state=active]:after:bg-primary",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    />
  );
}
