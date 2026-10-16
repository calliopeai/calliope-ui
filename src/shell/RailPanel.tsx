"use client";

import { ChevronsLeftIcon, ChevronsRightIcon, Maximize2Icon, Minimize2Icon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn.js";
import { useUI } from "../provider/UIProvider.js";
import { useRailPlacement } from "./placement.js";

export interface RailPanelProps {
  /** Names the rail: its landmark, and its show, hide, resize and expand controls. */
  label: string;
  /** The rail's heading row: an organization switcher, a title. Defaults to the label. */
  title?: React.ReactNode;
  /** Controls beside the title. */
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /**
   * Collapsed, a rail is a thin strip with a show button (Astrolift's projects
   * rail), or nothing at all, reopened from elsewhere (Zentinelle's assistant,
   * from a header button or `]`).
   */
  collapsedMode?: "strip" | "hidden";
  /** Under the show button, in the strip. */
  collapsedIcon?: React.ReactNode;
  /** px. Fixed unless `onWidthChange` is given. */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Makes the rail resizable from its inner edge, by pointer or by arrow keys. */
  onWidthChange?: (width: number) => void;
  /** The rail takes the content column (pair with AppShell's `rightRailExpanded`). */
  expanded?: boolean;
  /** Shows the expand and restore control. */
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

const STEP = 16;

/**
 * The right rail's frame: the slot where Astrolift keeps its projects and
 * Zentinelle docks its assistant. A rail pushes the content aside rather
 * than covering it. In the shell's drawer (narrow screens) it fills the
 * drawer and drops the controls that only make sense beside the content.
 */
export function RailPanel({
  label,
  title,
  actions,
  footer,
  children,
  collapsed,
  onCollapsedChange,
  collapsedMode = "strip",
  collapsedIcon,
  width = 260,
  minWidth = 200,
  maxWidth = 640,
  onWidthChange,
  expanded = false,
  onExpandedChange,
  className,
}: RailPanelProps) {
  const { messages } = useUI();
  const inDrawer = useRailPlacement() === "drawer";
  const clamp = (value: number) => Math.min(maxWidth, Math.max(minWidth, value));

  if (collapsed && !inDrawer) {
    if (collapsedMode === "hidden") return null;
    return (
      <aside
        aria-label={label}
        data-slot="rail-panel"
        data-collapsed
        className={cn(
          "flex h-full w-8 shrink-0 flex-col items-center gap-2 border-l border-sidebar-border bg-sidebar py-2 text-muted-foreground",
          className
        )}
      >
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          aria-label={messages.rail.show(label)}
          title={`${messages.rail.show(label)} (])`}
          className="flex size-7 items-center justify-center rounded-lg hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronsLeftIcon className="size-4" aria-hidden />
        </button>
        {collapsedIcon && (
          <span aria-hidden className="[&_svg]:size-4">
            {collapsedIcon}
          </span>
        )}
      </aside>
    );
  }

  const resizable = Boolean(onWidthChange) && !inDrawer && !expanded;
  const iconButton =
    "flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

  return (
    <aside
      aria-label={label}
      data-slot="rail-panel"
      data-expanded={expanded || undefined}
      style={inDrawer || expanded ? undefined : { width }}
      className={cn(
        "relative flex h-full min-h-0 shrink-0 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground",
        (inDrawer || expanded) && "w-full min-w-0 flex-1",
        inDrawer && "border-l-0",
        className
      )}
    >
      {resizable && (
        <ResizeHandle
          label={messages.rail.resize(label)}
          width={width}
          minWidth={minWidth}
          maxWidth={maxWidth}
          onWidthChange={(next) => onWidthChange?.(clamp(next))}
        />
      )}
      <div className="flex min-w-0 items-center gap-2 border-b border-sidebar-border px-3 py-2">
        <div className="min-w-0 flex-1 truncate text-sm font-semibold">{title ?? label}</div>
        {actions}
        {onExpandedChange && !inDrawer && (
          <button
            type="button"
            onClick={() => onExpandedChange(!expanded)}
            aria-label={expanded ? messages.rail.restore(label) : messages.rail.expand(label)}
            title={expanded ? messages.rail.restore(label) : messages.rail.expand(label)}
            className={iconButton}
          >
            {expanded ? (
              <Minimize2Icon className="size-4" aria-hidden />
            ) : (
              <Maximize2Icon className="size-4" aria-hidden />
            )}
          </button>
        )}
        {!inDrawer && (
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            aria-label={messages.rail.hide(label)}
            title={`${messages.rail.hide(label)} (])`}
            className={iconButton}
          >
            <ChevronsRightIcon className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="border-t border-sidebar-border px-3 py-2">{footer}</div>}
    </aside>
  );
}

/* A focusable separator is the WAI-ARIA window splitter, an interactive
   widget; jsx-a11y counts every separator as static. */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
function ResizeHandle({
  label,
  width,
  minWidth,
  maxWidth,
  onWidthChange,
}: {
  label: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
}) {
  const drag = React.useRef<{ x: number; width: number } | null>(null);
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      onKeyDown={(event) => {
        // The rail is on the right, so moving the edge left widens it.
        const next =
          event.key === "ArrowLeft"
            ? width + STEP
            : event.key === "ArrowRight"
              ? width - STEP
              : event.key === "Home"
                ? minWidth
                : event.key === "End"
                  ? maxWidth
                  : null;
        if (next === null) return;
        event.preventDefault();
        onWidthChange(next);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { x: event.clientX, width };
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (start) onWidthChange(start.width + (start.x - event.clientX));
      }}
      onPointerUp={(event) => {
        drag.current = null;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
      className="absolute inset-y-0 left-0 z-10 w-1.5 -translate-x-1/2 cursor-col-resize touch-none outline-none hover:bg-primary/40 focus-visible:bg-primary/60"
    />
  );
}
/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
