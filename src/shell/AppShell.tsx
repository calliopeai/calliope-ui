"use client";

import * as React from "react";

import { cn } from "../lib/cn.js";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../overlays/Drawer.js";
import { Button } from "../primitives/Button.js";
import { useUI } from "../provider/UIProvider.js";
import { RailPlacementContext } from "./placement.js";

interface AppShellBaseProps {
  /** The main rail, on the left: a Sidebar. */
  sidebar: React.ReactNode;
  children: React.ReactNode;
  /** A bar above the content, between the rails: global search, an assistant toggle. */
  header?: React.ReactNode;
  /** Above everything, full width: an incident banner. */
  banner?: React.ReactNode;
  /** `[`: collapse or expand the sidebar. */
  onToggleSidebar?: () => void;
  /** `]`: show or hide the right rail. */
  onToggleRightRail?: () => void;
  className?: string;
}

type RightRailProps =
  | { rightRail?: undefined; rightRailLabel?: undefined; rightRailExpanded?: undefined }
  | {
      /** The right rail: Astrolift's projects, Zentinelle's assistant dock. Usually a RailPanel. */
      rightRail: React.ReactNode;
      /** Names the right rail on narrow screens: its button and its drawer's title. */
      rightRailLabel: string;
      /** The right rail takes the whole content column (the assistant's full-width mode). */
      rightRailExpanded?: boolean;
    };

export type AppShellProps = AppShellBaseProps & RightRailProps;

function ignoresShortcut(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.isComposing)
    return true;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
    return true;
  // A dialog owns the keyboard while it is open.
  return Boolean(target.closest("[role='dialog'], [role='alertdialog']"));
}

/**
 * The app frame (Astrolift layout D, Zentinelle §5): the sidebar on the
 * left, the content between, the right rail on the right, each scrolling on
 * its own. Pure: it lays them out and owns only the shortcuts (`[` and `]`,
 * handed to the caller's collapse state) and, below `md`, the drawers the
 * rails open in.
 *
 * On narrow screens a rail renders inside a drawer as well as in its hidden
 * desktop place, so keep anything that must survive (an assistant's
 * conversation) in state above the shell, not inside the rail.
 */
export function AppShell({
  sidebar,
  children,
  header,
  rightRail,
  rightRailLabel,
  rightRailExpanded = false,
  banner,
  onToggleSidebar,
  onToggleRightRail,
  className,
}: AppShellProps) {
  const { messages } = useUI();
  const [drawer, setDrawer] = React.useState<"sidebar" | "rightRail" | null>(null);

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoresShortcut(event)) return;
      if (event.key === "[" && onToggleSidebar) {
        event.preventDefault();
        onToggleSidebar();
      } else if (event.key === "]" && onToggleRightRail) {
        event.preventDefault();
        onToggleRightRail();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onToggleSidebar, onToggleRightRail]);

  const railLabel = rightRailLabel ?? "";
  const drawerTitle = drawer === "rightRail" ? railLabel : messages.shell.navigation;

  return (
    <div
      data-slot="app-shell"
      className={cn("flex h-dvh min-h-0 w-full flex-col bg-background text-foreground", className)}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
      >
        {messages.shell.skipToContent}
      </a>
      {banner}
      <Drawer
        open={drawer !== null}
        onOpenChange={(open) => {
          if (!open) setDrawer(null);
        }}
      >
        <DrawerContent
          side={drawer === "rightRail" ? "right" : "left"}
          aria-describedby={undefined}
          className={cn(
            "gap-0 p-0",
            drawer === "rightRail" ? "w-full sm:max-w-md" : "w-72 max-w-[85vw]"
          )}
        >
          <DrawerHeader className="border-b">
            <DrawerTitle>{drawerTitle}</DrawerTitle>
          </DrawerHeader>
          {/* Delegated: a link's click, from a pointer or from Enter, bubbles here. */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="flex min-h-0 flex-1 flex-col"
            onClick={(event) => {
              // Following a link closes the drawer, as navigating would on a wide screen.
              if ((event.target as HTMLElement).closest("a[href]")) setDrawer(null);
            }}
          >
            <RailPlacementContext.Provider value="drawer">
              {drawer === "rightRail" ? rightRail : sidebar}
            </RailPlacementContext.Provider>
          </div>
        </DrawerContent>
      </Drawer>
      <div className="flex min-h-0 flex-1">
        <div className="hidden min-h-0 shrink-0 md:flex">{sidebar}</div>
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            rightRailExpanded && rightRail && "md:hidden"
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center gap-2 border-b px-3 py-2",
              !header && "md:hidden"
            )}
          >
            <div className="flex shrink-0 gap-2 md:hidden">
              <Button variant="outline" size="sm" onClick={() => setDrawer("sidebar")}>
                {messages.shell.navigation}
              </Button>
              {rightRail && (
                <Button variant="outline" size="sm" onClick={() => setDrawer("rightRail")}>
                  {railLabel}
                </Button>
              )}
            </div>
            {header && <div className="flex min-w-0 flex-1 items-center gap-2">{header}</div>}
          </div>
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 overflow-y-auto px-3 py-5 outline-none md:px-6"
          >
            {children}
          </main>
        </div>
        {rightRail && (
          <div
            className={cn(
              "hidden min-h-0 md:flex",
              rightRailExpanded ? "min-w-0 flex-1" : "shrink-0"
            )}
          >
            {rightRail}
          </div>
        )}
      </div>
    </div>
  );
}
