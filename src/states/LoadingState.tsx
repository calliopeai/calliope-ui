"use client";

import { cn } from "../lib/cn.js";
import { Skeleton } from "../primitives/Skeleton.js";
import { useUI } from "../provider/UIProvider.js";

export interface LoadingStateProps {
  /** Announced to screen readers ("Loading runs"). Defaults to "Loading". */
  label?: string;
  /**
   * `rows` stands in for a list: hairline rows in one panel. `page` stands in
   * for a whole route: a row of stat tiles over two panels. Tables draw their
   * own skeleton rows inside the real table, sized from the columns.
   */
  variant?: "rows" | "page";
  rows?: number;
  className?: string;
}

/** The loading placeholder: the geometry of what is coming, so nothing jumps when it lands. */
export function LoadingState({ label, variant = "rows", rows = 5, className }: LoadingStateProps) {
  const { messages } = useUI();
  const status = (
    <p role="status" className="sr-only">
      {label ?? messages.states.loading}
    </p>
  );

  if (variant === "page") {
    return (
      <div
        data-slot="loading-state"
        aria-busy
        className={cn("flex min-w-0 flex-1 flex-col gap-6", className)}
      >
        {status}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:col-span-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-60 w-full" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="loading-state"
      aria-busy
      className={cn("min-w-0 overflow-hidden rounded-lg border", className)}
    >
      {status}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b px-(--row-pad-x) py-(--row-pad-y) last:border-b-0"
        >
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}
