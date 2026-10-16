"use client";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn.js";
import type { NavIcon } from "../nav/model.js";
import { Skeleton } from "../primitives/Skeleton.js";
import { useUI } from "../provider/UIProvider.js";
import { StatusDot } from "../status/StatusDot.js";
import type { StatusTone } from "../status/tones.js";

export interface RailTreeItem {
  key: string;
  label: string;
  href: string;
  icon?: NavIcon;
  status?: StatusTone;
  /** Read with the status dot, which carries no text of its own ("failing"). */
  statusLabel?: string;
}

export interface RailTreeGroup {
  key: string;
  label: string;
  items: readonly RailTreeItem[];
}

export interface RailTreeProps {
  /** The tree's heading ("My projects"). */
  label: string;
  groups: readonly RailTreeGroup[];
  /** The page on screen: its row is lit and its group opens. */
  activeHref?: string;
  loading?: boolean;
  /** Shown when there are no groups. */
  emptyText: string;
  className?: string;
}

/**
 * A tree of linked groups for a rail: Astrolift's projects and the apps,
 * agents and workflows in each. It navigates; it never filters the lists on
 * the page. Each group shows its count and folds; the group holding the
 * current page starts open.
 */
export function RailTree({
  label,
  groups,
  activeHref,
  loading = false,
  emptyText,
  className,
}: RailTreeProps) {
  const headingId = React.useId();
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div
        id={headingId}
        className="px-3 pt-3 pb-1 text-2xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        {label}
      </div>
      <div className="px-2 pb-2">
        {loading ? (
          <div className="flex flex-col gap-2 px-1 pt-1" aria-busy>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <ul aria-labelledby={headingId} className="flex flex-col gap-0.5">
            {groups.map((group) => (
              <Branch key={group.key} group={group} activeHref={activeHref} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Branch({ group, activeHref }: { group: RailTreeGroup; activeHref?: string }) {
  const { Link } = useUI();
  const holdsActive = group.items.some((item) => item.href === activeHref);
  const [open, setOpen] = React.useState(holdsActive);
  const listId = React.useId();
  const Chevron = open ? ChevronDownIcon : ChevronRightIcon;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex h-7 w-full min-w-0 items-center gap-1.5 rounded-lg px-1.5 text-left text-sm hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Chevron className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate font-medium" title={group.label}>
          {group.label}
        </span>
        <span className="ml-auto font-mono text-2xs text-muted-foreground">
          {group.items.length}
        </span>
      </button>
      <ul
        id={listId}
        hidden={!open}
        className="ml-3 flex flex-col gap-0.5 border-l border-current/10 pl-2"
      >
        {group.items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-7 min-w-0 items-center gap-2 rounded-lg px-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isActive
                    ? "bg-primary/15 font-medium text-sidebar-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                )}
              >
                {Icon && <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />}
                <span className="truncate" title={item.label}>
                  {item.label}
                </span>
                {item.status && (
                  <StatusDot tone={item.status} label={item.statusLabel} className="ml-auto" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
