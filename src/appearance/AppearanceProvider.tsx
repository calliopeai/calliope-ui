"use client";

import * as React from "react";

import type { Density, Mode } from "../theme/tokens.js";
import { subscribeLocal } from "../lib/local-store.js";
import {
  type Appearance,
  type OrgAppearancePolicy,
  appearanceFromServer,
  applyAppearance,
  clearAppearance,
  normalizePartial,
  parseStoredAppearance,
  readAppearance,
  readStoredAppearance,
  resolveAppearance,
  writeAppearance,
} from "./appearance.js";
import type { Product } from "./product.js";

export interface AppearanceContextValue {
  product: Product;
  /** What applies now: the org lock, the person's choice, the org default or the product default. */
  appearance: Appearance;
  mode: Mode;
  /** True when an org policy locks the theme; the picker renders read-only. */
  locked: boolean;
  /** The person's own choice; null when they follow the org or the product. */
  personal: Partial<Appearance> | null;
  setAppearance: (patch: Partial<Appearance>) => void;
  /** Forget the person's choice ("use the default"), not "choose the defaults". */
  reset: () => void;
  /** Supply the org policy once it is known, from inside the signed-in layout. */
  setPolicy: (policy: OrgAppearancePolicy | null) => void;
  /** Take the person's preference from the app's server, without echoing it back through onChange. */
  applyServerAppearance: (personal: unknown) => void;
}

const AppearanceContext = React.createContext<AppearanceContextValue | null>(null);

const LIGHT_QUERY = "(prefers-color-scheme: light)";

function subscribeScheme(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(LIGHT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function systemMode(): Mode {
  return typeof window.matchMedia === "function" && window.matchMedia(LIGHT_QUERY).matches
    ? "light"
    : "dark";
}

const noSubscription = () => () => {};

export interface AppearanceProviderProps {
  product: Product;
  /** The org policy, when the caller already has it; `setPolicy` supplies it later otherwise. */
  policy?: OrgAppearancePolicy | null;
  /** Called with the person's new preference (null on reset), for an app that keeps it on its server. */
  onChange?: (personal: Partial<Appearance> | null) => void;
  /**
   * Controlled: the person's preference comes from here instead of
   * localStorage, and changes only reach `onChange`. For a catalog toolbar
   * or a test; an app leaves it out.
   */
  value?: Partial<Appearance> | null;
  children: React.ReactNode;
}

/**
 * Holds the person's appearance for one product and keeps <html> in step.
 * The preference is read from localStorage as an external store, so the
 * server render and hydration use the product default (AppearanceScript has
 * already painted the stored choice), other tabs follow through the storage
 * event, and nothing is set from an effect.
 *
 * The product config carries component references (navigation icons), so
 * create this provider in a client module rather than passing the product
 * across from a Server Component.
 */
export function AppearanceProvider({
  product,
  policy = null,
  onChange,
  value: controlled,
  children,
}: AppearanceProviderProps) {
  const isControlled = controlled !== undefined;
  const raw = React.useSyncExternalStore(
    subscribeLocal,
    () => readStoredAppearance(product),
    () => null
  );
  const scheme = React.useSyncExternalStore<Mode>(subscribeScheme, systemMode, () => "dark");
  const isClient = React.useSyncExternalStore(
    noSubscription,
    () => true,
    () => false
  );
  const [orgPolicy, setOrgPolicy] = React.useState(policy);

  const personal = React.useMemo(
    () =>
      isControlled
        ? controlled && Object.keys(normalizePartial(controlled, product)).length > 0
          ? normalizePartial(controlled, product)
          : null
        : parseStoredAppearance(raw, product),
    [isControlled, controlled, raw, product]
  );
  const { value, mode, locked } = React.useMemo(
    () => resolveAppearance(personal, orgPolicy, product, scheme),
    [personal, orgPolicy, product, scheme]
  );

  React.useEffect(() => {
    // While hydrating, the store reads above return their server snapshots,
    // so `value` is the product default rather than what the boot script
    // applied from storage; stamping it would flash. The client render that
    // follows hydration applies the real value.
    if (isClient) applyAppearance(value, product);
  }, [isClient, value, product]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const setAppearance = React.useCallback(
    (patch: Partial<Appearance>) => {
      if (locked) return;
      if (isControlled) {
        onChangeRef.current?.(normalizePartial({ ...(personal ?? {}), ...patch }, product));
        return;
      }
      // Read the stored value rather than the rendered one, so two changes
      // in one tick both land.
      const next = normalizePartial({ ...(readAppearance(product) ?? {}), ...patch }, product);
      writeAppearance(product, next);
      onChangeRef.current?.(next);
    },
    [locked, isControlled, personal, product]
  );

  const reset = React.useCallback(() => {
    if (locked) return;
    if (!isControlled) clearAppearance(product);
    onChangeRef.current?.(null);
  }, [locked, isControlled, product]);

  const applyServerAppearance = React.useCallback(
    (next: unknown) => {
      if (isControlled) return;
      const parsed = appearanceFromServer(next, product);
      if (parsed) writeAppearance(product, parsed);
      else clearAppearance(product);
    },
    [isControlled, product]
  );

  const setPolicy = React.useCallback((next: OrgAppearancePolicy | null) => setOrgPolicy(next), []);

  const context = React.useMemo<AppearanceContextValue>(
    () => ({
      product,
      appearance: value,
      mode,
      locked,
      personal,
      setAppearance,
      reset,
      setPolicy,
      applyServerAppearance,
    }),
    [product, value, mode, locked, personal, setAppearance, reset, setPolicy, applyServerAppearance]
  );

  return <AppearanceContext.Provider value={context}>{children}</AppearanceContext.Provider>;
}

/** The appearance context. Throws outside an AppearanceProvider. */
export function useAppearance(): AppearanceContextValue {
  const context = React.useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used inside <AppearanceProvider>");
  return context;
}

/** The product in context, or null outside an AppearanceProvider. */
export function useProduct(): Product | null {
  return React.useContext(AppearanceContext)?.product ?? null;
}

/** The density in context, or compact outside an AppearanceProvider. */
export function useDensity(): Density {
  return React.useContext(AppearanceContext)?.appearance.density ?? "compact";
}
