"use client";

import { cn } from "../lib/cn.js";
import { useUI } from "../provider/UIProvider.js";

export interface TabNavItem {
  key: string;
  label: string;
  href: string;
  active: boolean;
}

export interface TabNavProps {
  tabs: readonly TabNavItem[];
  /** The landmark's name ("Agent", "Views"). */
  label: string;
  className?: string;
}

/**
 * Tabs that are pages: an entity's Overview, Activity, Settings; a list's
 * views. Links, so each can be opened in a new tab and shared; the current
 * one carries `aria-current="page"`. One row at most per page, named by
 * function. On a narrow screen the row scrolls sideways under an edge fade.
 */
export function TabNav({ tabs, label, className }: TabNavProps) {
  const { Link } = useUI();
  return (
    <nav
      aria-label={label}
      className={cn(
        "flex min-w-0 [scrollbar-width:none] gap-1 overflow-x-auto border-b border-border [mask-image:linear-gradient(to_right,transparent_0,black_1.5rem,black_calc(100%-3rem),transparent_100%)] px-3 md:px-6",
        className
      )}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "relative shrink-0 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            tab.active
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {tab.active && (
            <span
              aria-hidden
              className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary"
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
