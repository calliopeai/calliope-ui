"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "../lib/cn.js";
import type { CrumbSwitchOption } from "../nav/model.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu.js";
import { useUI } from "../provider/UIProvider.js";

export interface Crumb {
  label: string;
  /** Absent on the last crumb, the page itself. */
  href?: string;
  /** The sideways move: the area's other functions (`areaSwitcher`), or the person's projects. */
  switcher?: readonly CrumbSwitchOption[];
}

export interface BreadcrumbsProps {
  crumbs: readonly Crumb[];
  /** The landmark's name. Defaults to "Breadcrumb". */
  label?: string;
  className?: string;
}

/**
 * Where the page sits. Crumbs come from the navigation model, never from
 * path segments (a segment is not always a page). The first crumb usually
 * switches between the area's functions.
 */
export function Breadcrumbs({ crumbs, label, className }: BreadcrumbsProps) {
  const { messages } = useUI();
  return (
    <nav aria-label={label ?? messages.breadcrumb.label} className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className="text-muted-foreground/60">
                ›
              </span>
            )}
            <CrumbItem crumb={crumb} isLast={i === crumbs.length - 1} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CrumbItem({ crumb, isLast }: { crumb: Crumb; isLast: boolean }) {
  const { Link, messages } = useUI();
  if (crumb.switcher && crumb.switcher.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={messages.breadcrumb.switchFrom(crumb.label)}
          className="inline-flex min-w-0 items-center gap-1 rounded-lg hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="truncate">{crumb.label}</span>
          <ChevronDownIcon className="size-3.5 shrink-0" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48">
          {crumb.switcher.map((option) => (
            <DropdownMenuItem key={option.href} asChild>
              <Link href={option.href} aria-current={option.active ? "page" : undefined}>
                <CheckIcon className={cn("size-3.5", !option.active && "invisible")} aria-hidden />
                {option.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  if (isLast || !crumb.href) {
    return (
      <span
        aria-current={isLast ? "page" : undefined}
        className={cn("min-w-0 truncate", isLast && "text-foreground")}
      >
        {crumb.label}
      </span>
    );
  }
  return (
    <Link
      href={crumb.href}
      className="min-w-0 truncate rounded-lg hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {crumb.label}
    </Link>
  );
}
