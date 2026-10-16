import type * as React from "react";

/**
 * The navigation model (Astrolift spec 44 §4.1 and §4.4; Zentinelle
 * ui-overhaul-ia §4.1): areas, optional groups inside an area, and the
 * functions in each group. A function is one sidebar row; its tabs, views
 * and actions live inside its pages. Pure data plus pure functions, so the
 * sidebar, the breadcrumb switcher and the tests read the same model, and a
 * Server Component can compute the active row.
 */

/** Any icon component: lucide-react's, or an app's own SVG. */
export type NavIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export interface NavFunction {
  key: string;
  label: string;
  href: string;
  icon?: NavIcon;
  /**
   * Capabilities that show this row; any one of them is enough. Absent means
   * always shown. The app decides what a capability is: Astrolift passes
   * module keys (`me.modules.<key>.canView`), Zentinelle passes roles.
   */
  requires?: string | readonly string[];
  /** Other path prefixes this row owns, for pages that sit under several routes. */
  also?: readonly string[];
  /** Extra attributes on the row's link, such as a tour anchor (`data-tour`). */
  attributes?: Readonly<Record<`data-${string}`, string>>;
}

export interface NavGroup {
  key?: string;
  label?: string;
  functions: readonly NavFunction[];
}

export interface NavArea {
  key: string;
  label: string;
  icon: NavIcon;
  /** Render the area's functions as top-level rows, with no area heading (Home, Overview). */
  flat?: boolean;
  groups: readonly NavGroup[];
}

export type NavModel = readonly NavArea[];

/** The row the current page belongs to. */
export interface NavActive {
  area: string;
  fn: string;
}

function allowed(fn: NavFunction, can: (capability: string) => boolean): boolean {
  if (fn.requires === undefined) return true;
  const required = typeof fn.requires === "string" ? [fn.requires] : fn.requires;
  return required.some(can);
}

/** The model with every row the viewer may not open removed, and empty groups and areas dropped. */
export function visibleNav(nav: NavModel, can: (capability: string) => boolean): NavArea[] {
  return nav
    .map((area) => ({
      ...area,
      groups: area.groups
        .map((group) => ({ ...group, functions: group.functions.filter((fn) => allowed(fn, can)) }))
        .filter((group) => group.functions.length > 0),
    }))
    .filter((area) => area.groups.length > 0);
}

/**
 * Which area and function own `pathname`: the function whose href (or `also`
 * prefix) is the longest prefix of it, so /agents/skills/42 is Skills, not
 * Agents. Query strings and fragments are ignored.
 */
export function activeFor(nav: NavModel, pathname: string): NavActive | null {
  const path = pathname.split(/[?#]/)[0] ?? pathname;
  let best: (NavActive & { length: number }) | null = null;
  for (const area of nav) {
    for (const group of area.groups) {
      for (const fn of group.functions) {
        for (const prefix of [fn.href, ...(fn.also ?? [])]) {
          const matches = path === prefix || path.startsWith(`${prefix}/`);
          if (matches && (!best || prefix.length > best.length)) {
            best = { area: area.key, fn: fn.key, length: prefix.length };
          }
        }
      }
    }
  }
  return best ? { area: best.area, fn: best.fn } : null;
}

export interface CrumbSwitchOption {
  label: string;
  href: string;
  active?: boolean;
}

/**
 * The first crumb of a page inside an area: the area's name, switching
 * between its functions with the current one checked. Read from the model,
 * so the sidebar and the breadcrumb always agree.
 */
export function areaSwitcher(
  nav: NavModel,
  area: string,
  activeFn: string
): { label: string; switcher: CrumbSwitchOption[] } {
  const found = nav.find((a) => a.key === area);
  return {
    label: found?.label ?? area,
    switcher: (found?.groups ?? []).flatMap((group) =>
      group.functions.map((fn) => ({ label: fn.label, href: fn.href, active: fn.key === activeFn }))
    ),
  };
}

/**
 * The model with every label passed through `translate`, for apps whose
 * copy lives in a message catalog. `fallback` is the model's own label;
 * return it when the catalog has no entry.
 */
export function localizeNav(
  nav: NavModel,
  translate: (kind: "area" | "group" | "function", key: string, fallback: string) => string
): NavArea[] {
  return nav.map((area) => ({
    ...area,
    label: translate("area", area.key, area.label),
    groups: area.groups.map((group) => ({
      ...group,
      ...(group.label !== undefined
        ? { label: translate("group", group.key ?? group.label, group.label) }
        : {}),
      functions: group.functions.map((fn) => ({
        ...fn,
        label: translate("function", fn.key, fn.label),
      })),
    })),
  }));
}
