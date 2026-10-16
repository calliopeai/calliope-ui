"use client";

import type * as React from "react";

import { cn } from "../lib/cn.js";
import { type PageHeaderProps, PageHeader } from "./PageHeader.js";

export interface PageFrameProps extends PageHeaderProps {
  /** The filter bar, under the header: search, filter selects, the list's actions. */
  filters?: React.ReactNode;
  /** A notice the reader must see before the body (a one-time reveal). Not a second list. */
  notice?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A page: its header (breadcrumb, title, actions, tabs), an optional filter
 * bar and notice, then the body. The body is made of Sections holding Cards,
 * tables or charts, two container levels at most (Astrolift's container
 * rule). A page fits about two screens; more becomes a tab, a section that
 * loads when opened, or a drawer.
 */
export function PageFrame({ filters, notice, children, className, ...header }: PageFrameProps) {
  return (
    <div data-slot="page-frame" className={cn("flex min-w-0 flex-1 flex-col gap-4", className)}>
      <PageHeader {...header} />
      {notice}
      {filters && (
        <div data-slot="page-filters" className="flex min-w-0 flex-wrap items-center gap-2">
          {filters}
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
