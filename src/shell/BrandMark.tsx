"use client";

import type * as React from "react";

import { useProduct } from "../appearance/AppearanceProvider.js";
import { cn } from "../lib/cn.js";
import { useUI } from "../provider/UIProvider.js";

export interface BrandMarkProps {
  /** Where the mark leads: the product's home. */
  href: string;
  /** The product's logo mark (an <img> or SVG). Decorative: the name or the label carries the meaning. */
  mark?: React.ReactNode;
  /** Defaults to the product's name from AppearanceProvider. */
  name?: string;
  /** The mark alone, for the collapsed sidebar. */
  collapsed?: boolean;
  className?: string;
}

/** The product's mark and name, heading the sidebar. */
export function BrandMark({ href, mark, name, collapsed = false, className }: BrandMarkProps) {
  const { Link } = useUI();
  const product = useProduct();
  const title = name ?? product?.name;
  if (!title) throw new Error("BrandMark needs a name, or an AppearanceProvider with a product");

  return (
    <Link
      href={href}
      aria-label={collapsed ? title : undefined}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        collapsed && "justify-center",
        className
      )}
    >
      {mark && (
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 ring-1 ring-sidebar-primary/30 [&_img]:size-4.5 [&_svg]:size-4.5"
        >
          {mark}
        </span>
      )}
      {!collapsed && (
        <span className="truncate font-head text-sm font-semibold tracking-tight">{title}</span>
      )}
    </Link>
  );
}
