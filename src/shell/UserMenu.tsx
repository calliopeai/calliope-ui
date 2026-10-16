"use client";

import { LogOutIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/cn.js";
import type { NavIcon } from "../nav/model.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu.js";
import { useUI } from "../provider/UIProvider.js";

export interface UserMenuItem {
  label: string;
  icon?: NavIcon;
  /** A page: every item is a link unless it acts in place. */
  href?: string;
  /** An action in place (open the appearance picker, say) when there is no page. */
  onSelect?: () => void;
}

export interface UserMenuProps {
  name: string;
  email: string;
  /** Groups of items, separated by rules: account pages, then help. */
  groups?: readonly (readonly UserMenuItem[])[];
  onSignOut: () => void;
  /** The avatar alone, for a collapsed rail. */
  collapsed?: boolean;
  className?: string;
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/** The signed-in person's menu, at the foot of the sidebar. Pure: the person, the items and sign-out are the app's. */
export function UserMenu({
  name,
  email,
  groups = [],
  onSignOut,
  collapsed = false,
  className,
}: UserMenuProps) {
  const { Link, messages } = useUI();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        // Expanded, the visible name and email are the trigger's name (WCAG
        // 2.5.3, label in name); collapsed, only the initials show, so it
        // needs one.
        aria-label={collapsed ? messages.user.accountMenu(name, initialsOf(name)) : undefined}
        className={cn(
          "flex h-10 w-full min-w-0 items-center gap-2 rounded-lg px-1.5 text-left hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          collapsed && "justify-center px-0",
          className
        )}
      >
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-medium text-foreground"
        >
          {initialsOf(name)}
        </span>
        {!collapsed && (
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-medium">{name}</span>{" "}
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="min-w-56">
        <DropdownMenuLabel className="grid font-normal">
          <span className="truncate text-sm font-medium text-popover-foreground">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        {groups.map((items, i) => (
          <MenuGroup key={i} items={items} Link={Link} />
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOutIcon aria-hidden /> {messages.user.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuGroup({
  items,
  Link,
}: {
  items: readonly UserMenuItem[];
  Link: ReturnType<typeof useUI>["Link"];
}) {
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {items.map((item) => {
          const Icon = item.icon;
          const content: React.ReactNode = (
            <>
              {Icon && <Icon aria-hidden />} {item.label}
            </>
          );
          return item.href ? (
            <DropdownMenuItem key={item.label} asChild>
              <Link href={item.href}>{content}</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
              {content}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>
    </>
  );
}
