"use client";

import * as React from "react";

import {
  type MessageOverrides,
  type Messages,
  defaultMessages,
  mergeMessages,
} from "./messages.js";

/** What the package hands a link: anchor props with a string `href`. */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  ref?: React.Ref<HTMLAnchorElement>;
}

/** The app's link component: next/link, a router's Link, or a plain anchor. */
export type LinkComponent = React.ComponentType<LinkProps>;

function Anchor({ ref, children, ...props }: LinkProps) {
  return (
    <a ref={ref} {...props}>
      {children}
    </a>
  );
}

interface UIContextValue {
  Link: LinkComponent;
  messages: Messages;
}

const UIContext = React.createContext<UIContextValue>({ Link: Anchor, messages: defaultMessages });

export interface UIProviderProps {
  /** Rendered for every link the package draws. Defaults to a plain `<a>`. */
  link?: LinkComponent;
  /** Copy overrides, one level deep (`{ table: { retry: "Reintentar" } }`). */
  messages?: MessageOverrides;
  children: React.ReactNode;
}

/**
 * The app's environment: its link component and its copy. The package never
 * imports a router, so this is how navigation stays the app's: pass next/link
 * in a Next app, your router's Link elsewhere. Without a provider every link
 * is a plain anchor and every string is English.
 */
export function UIProvider({ link, messages, children }: UIProviderProps) {
  const value = React.useMemo(
    () => ({ Link: link ?? Anchor, messages: mergeMessages(messages) }),
    [link, messages]
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  return React.useContext(UIContext);
}
