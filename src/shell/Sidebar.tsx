"use client";

import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/cn.js";
import type { NavActive, NavModel } from "../nav/model.js";
import { Nav } from "../nav/Nav.js";
import { useUI } from "../provider/UIProvider.js";
import { useRailPlacement } from "./placement.js";

export interface SidebarProps {
  /** The model, filtered to what the viewer may open (`visibleNav`). */
  nav: NavModel;
  /** The current row (`activeFor(nav, pathname)`). */
  active: NavActive | null;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Above the areas: the brand mark. */
  header?: React.ReactNode;
  /** The mark alone, for the collapsed rail; nothing when absent (a name cut to one letter reads as a bug). */
  headerCollapsed?: React.ReactNode;
  /** Below the areas: the user menu, notifications, help. Hidden while collapsed. */
  footer?: React.ReactNode;
  /** The navigation landmark's name. Defaults to "Main". */
  label?: string;
  className?: string;
}

/**
 * The main rail, on the left (Astrolift layout D): the one brand surface.
 * 220px with labels, 48px with icons. Pure: the filtered model, the active
 * row and the collapsed state are the caller's; `[` toggles it through the
 * AppShell.
 */
export function Sidebar({
  nav,
  active,
  collapsed: collapsedProp,
  onCollapsedChange,
  header,
  headerCollapsed,
  footer,
  label,
  className,
}: SidebarProps) {
  const { messages } = useUI();
  const inDrawer = useRailPlacement() === "drawer";
  const collapsed = collapsedProp && !inDrawer;

  return (
    <div
      data-slot="sidebar"
      data-collapsed={collapsed || undefined}
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        inDrawer ? "w-full border-r-0" : "transition-[width] duration-(--motion-base)",
        !inDrawer && (collapsed ? "w-12" : "w-55"),
        className
      )}
    >
      {collapsed
        ? headerCollapsed && <div className="flex justify-center py-3">{headerCollapsed}</div>
        : header && <div className="flex min-w-0 items-center px-3 py-3">{header}</div>}
      <nav
        aria-label={label ?? messages.nav.label}
        className="min-h-0 flex-1 overflow-y-auto px-2 py-1"
      >
        <Nav nav={nav} active={active} collapsed={collapsed} />
      </nav>
      {(footer || !inDrawer) && (
        <div className="flex flex-col gap-1 border-t border-sidebar-border px-2 py-2">
          {!collapsed && footer}
          {!inDrawer && (
            <button
              type="button"
              onClick={() => onCollapsedChange(!collapsed)}
              aria-label={collapsed ? messages.nav.expand : messages.nav.collapse}
              title={collapsed ? messages.nav.expandTitle : messages.nav.collapseTitle}
              className="flex h-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {collapsed ? (
                <ChevronsRightIcon className="size-4" aria-hidden />
              ) : (
                <ChevronsLeftIcon className="size-4" aria-hidden />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
