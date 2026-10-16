import type * as React from "react";

import { cn } from "../lib/cn.js";

/** A placeholder block with the geometry of what it stands in for. It pulses; with reduced motion it holds still. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
