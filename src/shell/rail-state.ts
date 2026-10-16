"use client";

import * as React from "react";

import { readLocal, subscribeLocal, writeLocal } from "../lib/local-store.js";

/**
 * One rail's collapsed state, remembered per person in this browser.
 * `defaultCollapsed` applies until they choose: Astrolift's projects rail
 * passes "narrower than 1280px". The server renders the rail expanded and the
 * client applies the saved choice without a hydration mismatch; a change in
 * one tab reaches the others.
 */
export function useRailState(
  storageKey: string,
  defaultCollapsed: () => boolean = () => false
): readonly [boolean, (collapsed: boolean) => void] {
  const collapsed = React.useSyncExternalStore(
    subscribeLocal,
    () => {
      const saved = readLocal(storageKey);
      return saved === "1" ? true : saved === "0" ? false : defaultCollapsed();
    },
    () => false
  );
  const set = React.useCallback(
    (next: boolean) => writeLocal(storageKey, next ? "1" : "0"),
    [storageKey]
  );
  return [collapsed, set] as const;
}

/** A resizable rail's width in px, remembered like its collapsed state and held to its range. */
export function useRailWidth(
  storageKey: string,
  defaultWidth: number,
  range: { min: number; max: number }
): readonly [number, (width: number) => void] {
  const { min, max } = range;
  const width = React.useSyncExternalStore(
    subscribeLocal,
    () => {
      const saved = Number(readLocal(storageKey));
      return Number.isFinite(saved) && saved >= min && saved <= max ? saved : defaultWidth;
    },
    () => defaultWidth
  );
  const set = React.useCallback(
    (next: number) =>
      writeLocal(storageKey, String(Math.round(Math.min(max, Math.max(min, next))))),
    [storageKey, min, max]
  );
  return [width, set] as const;
}
