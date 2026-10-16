"use client";

import type * as React from "react";

import { cn } from "../lib/cn.js";
import { type Crumb, Breadcrumbs } from "./Breadcrumbs.js";
import { type TabNavItem, TabNav } from "./TabNav.js";

export interface PageHeaderProps {
  crumbs?: readonly Crumb[];
  title: React.ReactNode;
  /** A status badge beside the title. */
  status?: React.ReactNode;
  /** One line of context beside the title: environment, region, model. */
  context?: React.ReactNode;
  /** Supporting copy under the title row. */
  description?: React.ReactNode;
  /** The page's one primary action. */
  primaryAction?: React.ReactNode;
  /** The `⋯` menu, beside the primary action. */
  menu?: React.ReactNode;
  /** At most one row of tabs: the views of a list, or an entity's own tabs. */
  tabs?: readonly TabNavItem[];
  /** Names the tab row. Defaults to "Page". */
  tabsLabel?: string;
  className?: string;
}

/**
 * Every page's header, in three rows (Astrolift spec 44 §4.4): the
 * breadcrumb, the title row with its status, context and actions, and at
 * most one row of tabs. Pure.
 */
export function PageHeader({
  crumbs,
  title,
  status,
  context,
  description,
  primaryAction,
  menu,
  tabs,
  tabsLabel = "Page",
  className,
}: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn("flex min-w-0 flex-col gap-3", className)}>
      {crumbs && crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="min-w-0 truncate font-head text-xl font-semibold">{title}</h1>
        {status}
        {context && (
          <span className="min-w-0 truncate text-sm text-muted-foreground">{context}</span>
        )}
        {(primaryAction || menu) && (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {primaryAction}
            {menu}
          </div>
        )}
      </div>
      {description && (
        <div className="max-w-2xl text-sm [overflow-wrap:anywhere] text-muted-foreground">
          {description}
        </div>
      )}
      {tabs && tabs.length > 0 && (
        <TabNav tabs={tabs} label={tabsLabel} className="-mx-3 md:-mx-6" />
      )}
    </header>
  );
}
