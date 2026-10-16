"use client";

import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";

import { cn } from "../lib/cn.js";
import { Button } from "../primitives/Button.js";
import { useUI } from "../provider/UIProvider.js";

export interface ErrorStateProps {
  /** What failed ("Could not load runs"). Defaults to "Something went wrong". */
  title?: string;
  /** The error, or its message. Without one, a generic line. */
  error?: string | { message: string } | null;
  onRetry?: () => void;
  retryLabel?: string;
  /**
   * `inline` is a callout inside a page, for one query that failed. `page` is
   * the whole surface, for an error boundary: centred, with the digest a
   * report can be traced by, and a way out when retrying fails the same way.
   */
  variant?: "inline" | "page";
  /** The server's error digest, shown on the page variant. */
  digest?: string;
  /** A known-good page to escape to, on the page variant. */
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}

export function ErrorState({
  title,
  error,
  onRetry,
  retryLabel,
  variant = "inline",
  digest,
  homeHref,
  homeLabel,
  className,
}: ErrorStateProps) {
  const { Link, messages } = useUI();
  const message =
    (typeof error === "string" ? error : error?.message) || messages.states.unexpected;
  const heading = title ?? messages.states.errorTitle;
  const retry = onRetry && (
    <Button type="button" size="sm" variant="outline" onClick={onRetry}>
      {retryLabel ?? messages.states.retry}
    </Button>
  );

  if (variant === "page") {
    return (
      <div
        role="alert"
        data-slot="error-state"
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center",
          className
        )}
      >
        <div aria-hidden className="rounded-full bg-danger-bg p-4 text-danger">
          <CircleAlertIcon className="size-8" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="mt-1 max-w-sm text-sm [overflow-wrap:anywhere] text-muted-foreground">
            {message}
          </p>
          {digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {messages.states.errorId(digest)}
            </p>
          )}
        </div>
        {(retry || homeHref) && (
          <div className="flex items-center gap-2">
            {retry}
            {homeHref && homeLabel && (
              <Button asChild size="sm" variant="ghost">
                <Link href={homeHref}>{homeLabel}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      data-slot="error-state"
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-lg border border-danger-border bg-danger/5 p-4",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-danger-fg">{heading}</p>
          <p className="mt-1 text-xs [overflow-wrap:anywhere] text-muted-foreground">{message}</p>
        </div>
      </div>
      {retry && <div>{retry}</div>}
    </div>
  );
}
