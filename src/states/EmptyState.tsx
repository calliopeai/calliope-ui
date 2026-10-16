"use client";

import { ExternalLinkIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/cn.js";
import { Button } from "../primitives/Button.js";
import { useUI } from "../provider/UIProvider.js";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** The create action: a link, so it can open in a new tab. */
  actionHref?: string;
  actionLabel?: string;
  /**
   * Context help, low-prominence beneath the description (Astrolift #356).
   * External URLs open in a new tab; app paths go through the app's link.
   */
  learnMoreHref?: string;
  learnMoreLabel?: string;
  /** Anything else: a secondary action, a button with a handler. */
  secondary?: React.ReactNode;
  className?: string;
}

/** Nothing to show yet, with the way to change that. "No matches" is a different state; see DataTable. */
export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  learnMoreHref,
  learnMoreLabel,
  secondary,
  className,
}: EmptyStateProps) {
  const { Link, messages } = useUI();
  const learnMoreText = learnMoreLabel ?? messages.states.learnMore;
  const external = learnMoreHref ? /^https?:\/\//.test(learnMoreHref) : false;
  const learnMoreClass =
    "mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline";

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center whitespace-normal",
        className
      )}
    >
      {icon && (
        <div aria-hidden className="rounded-lg bg-muted p-2 text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium [overflow-wrap:anywhere]">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {learnMoreHref &&
          (external ? (
            <a href={learnMoreHref} target="_blank" rel="noreferrer" className={learnMoreClass}>
              {learnMoreText}
              <ExternalLinkIcon className="size-3" aria-hidden />
            </a>
          ) : (
            <Link href={learnMoreHref} className={learnMoreClass}>
              {learnMoreText}
            </Link>
          ))}
      </div>
      {actionHref && actionLabel && (
        <Button asChild size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {secondary}
    </div>
  );
}
