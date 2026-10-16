"use client";

import type * as React from "react";

import { cn } from "../lib/cn.js";
import { Skeleton } from "../primitives/Skeleton.js";
import { useUI } from "../provider/UIProvider.js";
import { EmptyState } from "../states/EmptyState.js";
import { ErrorState } from "../states/ErrorState.js";
import type { Density } from "../theme/tokens.js";
import type { EmptyStateSpec } from "./types.js";

export interface ListProps<TItem> {
  /** Names the list for screen readers and in its error copy. */
  label: string;
  items: readonly TItem[];
  getKey: (item: TItem) => string;
  /** One item's content, usually a ListItem. The list draws the row or the card around it. */
  renderItem: (item: TItem) => React.ReactNode;
  /** Overrides the person's density for this list. */
  density?: Density;
  loading?: boolean;
  /** How many placeholder items to draw while loading. */
  loadingCount?: number;
  error?: { message: string } | null;
  onRetry?: () => void;
  /** Required: a list never renders nothing. */
  empty: EmptyStateSpec;
  className?: string;
}

/**
 * A short, fixed list (integrations, links, a summary's top five) in the
 * person's density: compact is one panel of hairline rows; cards boxes each
 * item and flows them into responsive columns. Six links with a name and a
 * sentence are a list, not six cards, until someone asks for cards.
 *
 * The layout is driven by CSS variables that `data-density` sets, so the
 * first paint already has the right one and a subtree can override it. A
 * list that can grow without bound is a DataTable, with server paging.
 */
export function List<TItem>({
  label,
  items,
  getKey,
  renderItem,
  density,
  loading = false,
  loadingCount = 4,
  error,
  onRetry,
  empty,
  className,
}: ListProps<TItem>) {
  const { messages } = useUI();
  const frame =
    "grid min-w-0 grid-cols-(--list-columns) gap-(--list-gap) overflow-hidden rounded-(--list-frame-radius) border-(length:--list-frame-border)";
  const box =
    "relative min-w-0 rounded-(--list-item-radius) border-(length:--list-item-border) bg-(--list-item-bg) [padding:var(--list-item-pad)] not-first:border-t";

  if (error) {
    return (
      <ErrorState
        title={messages.table.loadFailed(label)}
        error={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }
  if (loading) {
    return (
      <div data-slot="list" data-density={density} aria-busy className={cn(frame, className)}>
        <p role="status" className="sr-only">
          {messages.states.loading}
        </p>
        {Array.from({ length: loadingCount }, (_, i) => (
          <div key={i} className={cn(box, "flex items-center gap-3")}>
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return <EmptyState {...empty} className={className} />;
  }
  return (
    <ul data-slot="list" data-density={density} aria-label={label} className={cn(frame, className)}>
      {items.map((item) => (
        <li key={getKey(item)} className={box}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

export interface ListItemProps {
  title: React.ReactNode;
  /** The whole item links here; the title is the link, stretched over the item. */
  href?: string;
  description?: React.ReactNode;
  /** Leading: an icon or a logo. */
  icon?: React.ReactNode;
  /** Trailing data: mono values, counts, times. */
  meta?: React.ReactNode;
  /** A StatusBadge. */
  status?: React.ReactNode;
  /** Controls, kept above the item's stretched link. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * One item's content: a row in compact density (icon, title and description,
 * then meta, status and actions on the right) and a card in cards density
 * (the same parts stacked).
 */
export function ListItem({
  title,
  href,
  description,
  icon,
  meta,
  status,
  actions,
  className,
}: ListItemProps) {
  const { Link } = useUI();
  return (
    <div
      data-slot="list-item"
      className={cn(
        "flex min-w-0 [flex-direction:var(--list-item-direction)] [align-items:var(--list-item-align)] gap-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon && (
          <span aria-hidden className="mt-0.5 shrink-0 text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {href ? (
              <Link
                href={href}
                className="outline-none after:absolute after:inset-0 after:rounded-(--list-item-radius) hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </p>
          {description && (
            <p className="mt-0.5 line-clamp-2 text-sm [overflow-wrap:anywhere] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {(meta || status || actions) && (
        <div className="[margin-inline-start:var(--list-item-trail)] flex shrink-0 flex-wrap items-center gap-2">
          {meta && (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{meta}</span>
          )}
          {status}
          {actions && <span className="relative z-10 flex items-center gap-1">{actions}</span>}
        </div>
      )}
    </div>
  );
}
