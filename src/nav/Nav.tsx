"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn.js";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/Popover.js";
import { useUI } from "../provider/UIProvider.js";
import type { NavActive, NavArea, NavFunction, NavModel } from "./model.js";

export interface NavProps {
  /** The model, already filtered to what the viewer may open (`visibleNav`). */
  nav: NavModel;
  /** The row the current page belongs to (`activeFor`). */
  active: NavActive | null;
  /** Icons only, with each area's functions in a flyout. */
  collapsed?: boolean;
  /** Called when a row is followed, so a drawer holding the nav can close. */
  onNavigate?: () => void;
  className?: string;
}

/**
 * The areas and their functions (Astrolift spec 44 §4.1). Expanded, each area
 * is a heading that folds, over its groups and rows; a flat area (Home,
 * Overview) is just its rows. Collapsed, each area is an icon, and hovering,
 * focusing or pressing it opens its rows as a flyout. The current row is the
 * one lit row: an accent tint and a 2px accent edge.
 */
export function Nav({ nav, active, collapsed = false, onNavigate, className }: NavProps) {
  return (
    <div className={cn("flex flex-col", collapsed ? "items-center gap-1" : "gap-2", className)}>
      {nav.map((area) =>
        collapsed ? (
          <CollapsedArea key={area.key} area={area} active={active} onNavigate={onNavigate} />
        ) : (
          <ExpandedArea key={area.key} area={area} active={active} onNavigate={onNavigate} />
        )
      )}
    </div>
  );
}

function FunctionLink({
  fn,
  isActive,
  onNavigate,
}: {
  fn: NavFunction;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const { Link } = useUI();
  const Icon = fn.icon;
  return (
    <Link
      href={fn.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      {...fn.attributes}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isActive
          ? "bg-primary/15 font-medium text-sidebar-foreground shadow-[inset_2px_0_0_var(--primary)]"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      {Icon && <Icon className="size-4 shrink-0 opacity-80" aria-hidden />}
      <span className="truncate">{fn.label}</span>
    </Link>
  );
}

function Rows({
  area,
  active,
  onNavigate,
}: {
  area: NavArea;
  active: NavActive | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      {area.groups.map((group, i) => (
        <div key={group.key ?? group.label ?? i} className="flex flex-col gap-0.5">
          {group.label && (
            <div className="px-2 pt-2 pb-1 text-2xs text-muted-foreground">{group.label}</div>
          )}
          {group.functions.map((fn) => (
            <FunctionLink
              key={fn.key}
              fn={fn}
              isActive={active?.area === area.key && active.fn === fn.key}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function ExpandedArea({
  area,
  active,
  onNavigate,
}: {
  area: NavArea;
  active: NavActive | null;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState(true);
  const regionId = React.useId();
  if (area.flat) {
    return (
      <div className="flex flex-col gap-0.5">
        <Rows area={area} active={active} onNavigate={onNavigate} />
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={regionId}
        className="flex h-7 w-full items-center justify-between rounded-lg px-2 text-2xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {area.label}
        <ChevronDownIcon
          className={cn("size-3 transition-transform", !open && "-rotate-90")}
          aria-hidden
        />
      </button>
      <div id={regionId} hidden={!open} className="flex flex-col gap-0.5">
        <Rows area={area} active={active} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/** How long the pointer may be away from a flyout before it closes. */
const FLYOUT_GRACE_MS = 150;

function CollapsedArea({
  area,
  active,
  onNavigate,
}: {
  area: NavArea;
  active: NavActive | null;
  onNavigate?: () => void;
}) {
  const { Link } = useUI();
  const [open, setOpen] = React.useState(false);
  const pointerOpened = React.useRef(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = active?.area === area.key;
  const Icon = area.icon;
  const only =
    area.groups.length === 1 && area.groups[0]?.functions.length === 1
      ? area.groups[0].functions[0]
      : null;

  React.useEffect(() => {
    const timer = closeTimer;
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const tile = (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-lg",
        isActive
          ? "bg-primary/15 text-sidebar-foreground shadow-[inset_2px_0_0_var(--primary)]"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );

  // One row: the icon is that row's link, no flyout needed.
  if (only) {
    return (
      <Link
        href={only.href}
        onClick={onNavigate}
        aria-label={area.flat ? only.label : area.label}
        title={area.flat ? only.label : area.label}
        aria-current={isActive ? "page" : undefined}
        {...only.attributes}
        className="flex rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {tile}
      </Link>
    );
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), FLYOUT_GRACE_MS);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) pointerOpened.current = false;
        setOpen(next);
      }}
    >
      <PopoverTrigger
        aria-label={area.label}
        title={area.label}
        className="flex rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          cancelClose();
          pointerOpened.current = true;
          setOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
      >
        {tile}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-56 gap-0 p-2"
        // Opened by hovering: leave focus where the person is. Opened from the
        // keyboard: move it in, to the first row.
        onOpenAutoFocus={(event) => {
          if (pointerOpened.current) event.preventDefault();
        }}
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
      >
        <div className="px-2 pb-1 text-2xs font-semibold tracking-wider text-muted-foreground uppercase">
          {area.label}
        </div>
        <Rows
          area={area}
          active={active}
          onNavigate={() => {
            setOpen(false);
            onNavigate?.();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
