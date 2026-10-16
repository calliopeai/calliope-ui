import { readLocal, writeLocal } from "../lib/local-store.js";
import { MIN_NON_TEXT_CONTRAST, contrastRatio } from "../theme/contrast.js";
import { GROUNDS, SURFACES, type Density, type Ground, type Mode } from "../theme/tokens.js";
import { CORNERS, type Corners, type Product } from "./product.js";

/**
 * Appearance: the axes a person sets for themselves, per product.
 *
 *   ground    the surface ramp; it implies light or dark (`data-mode`)
 *   accent    the action colour and lead chart series: the product's accent,
 *             a family accent, or any `#rrggbb` that stands 3:1 off the ground
 *   density   compact | cards
 *   corners   0 | 2 | 4 | 10 px
 *
 * A per-person display preference, not org state. It lives in localStorage
 * because it must apply before first paint (AppearanceScript), which rules out
 * waiting for a fetch; an app that also keeps it on its server hands it back
 * through `AppearanceProvider`. Reads are defensive: Safari private mode and
 * embedded webviews throw on storage access rather than returning null.
 */

export type CustomAccent = `#${string}`;

export interface Appearance {
  ground: Ground;
  /** A product accent key, or a custom `#rrggbb`. */
  accent: string;
  density: Density;
  corners: Corners;
}

/**
 * Org policy: a house theme for people who have not chosen, optionally
 * locked so the personal picker becomes read-only.
 */
export interface OrgAppearancePolicy {
  orgDefault?: Partial<Appearance> | null;
  locked?: boolean;
}

export interface ResolvedAppearance {
  value: Appearance;
  mode: Mode;
  /** True when the org locked the theme; the picker renders read-only. */
  locked: boolean;
}

const HEX = /^#[0-9a-f]{6}$/;

export function modeFor(ground: Ground): Mode {
  return GROUNDS[ground].mode;
}

/** A well-formed custom accent: lowercase `#rrggbb`. */
export function isCustomAccent(value: unknown): value is CustomAccent {
  return typeof value === "string" && HEX.test(value);
}

/** `#RGB`, `rrggbb` or `#RRGGBB` as a stored custom accent, or null. */
export function parseCustomAccent(raw: string): CustomAccent | null {
  let value = raw.trim().toLowerCase();
  if (!value.startsWith("#")) value = `#${value}`;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return isCustomAccent(value) ? value : null;
}

/** A custom accent's contrast against a ground's page colour, and whether it clears 3:1. */
export function accentContrast(
  accent: CustomAccent,
  ground: Ground
): { ratio: number; ok: boolean } {
  const ratio = contrastRatio(accent, SURFACES[ground].background);
  return { ratio, ok: ratio >= MIN_NON_TEXT_CONTRAST };
}

/** Black or white, whichever reads better on a filled accent. */
export function inkFor(accent: CustomAccent): "#000000" | "#ffffff" {
  return contrastRatio(accent, "#000000") >= contrastRatio(accent, "#ffffff")
    ? "#000000"
    : "#ffffff";
}

function isGround(product: Product, value: unknown): value is Ground {
  return typeof value === "string" && (product.grounds as readonly string[]).includes(value);
}

function isProductAccent(product: Product, value: unknown): value is string {
  return typeof value === "string" && product.accents.some((a) => a.key === value);
}

function isCorners(value: unknown): value is Corners {
  return CORNERS.includes(value as Corners);
}

/**
 * Keep only the axes that are present and valid for this product, without
 * filling in the rest. A partial has to stay partial: an org that pins only
 * the accent must not thereby pin the ground, and a stored `{accent}` must
 * leave the other axes to the org default.
 */
export function normalizePartial(raw: unknown, product: Product): Partial<Appearance> {
  const v = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const out: Partial<Appearance> = {};
  if (isGround(product, v.ground)) out.ground = v.ground;
  if (isProductAccent(product, v.accent) || isCustomAccent(v.accent)) out.accent = v.accent;
  if (v.density === "compact" || v.density === "cards") out.density = v.density;
  if (isCorners(v.corners)) out.corners = v.corners;
  return out;
}

/**
 * A complete appearance from anything. The ground falls back to the
 * product's default for `systemMode`; a custom accent that cannot be seen on
 * the ground it lands on falls back to the product's accent.
 */
export function normalize(raw: unknown, product: Product, systemMode: Mode = "dark"): Appearance {
  const v = normalizePartial(raw, product);
  const ground = v.ground ?? product.defaults.ground[systemMode];
  const accent =
    v.accent !== undefined && (!isCustomAccent(v.accent) || accentContrast(v.accent, ground).ok)
      ? v.accent
      : product.defaults.accent;
  return {
    ground,
    accent,
    density: v.density ?? product.defaults.density,
    corners: v.corners ?? product.defaults.corners,
  };
}

/**
 * Precedence: a locked org theme beats everything; otherwise a personal
 * choice beats the org default, which beats the product default. Until
 * someone picks a ground, light or dark follows the operating system.
 */
export function resolveAppearance(
  personal: Partial<Appearance> | null,
  policy: OrgAppearancePolicy | null,
  product: Product,
  systemMode: Mode = "dark"
): ResolvedAppearance {
  const orgDefault = normalizePartial(policy?.orgDefault ?? null, product);
  const locked = Boolean(policy?.locked);
  const merged = locked
    ? orgDefault
    : { ...orgDefault, ...normalizePartial(personal ?? {}, product) };
  const value = normalize(merged, product, systemMode);
  return { value, mode: modeFor(value.ground), locked };
}

/** The stored preference as written, or null. Used as the external-store snapshot. */
export function readStoredAppearance(product: Product): string | null {
  return readLocal(product.storageKey);
}

/** Parse a stored preference; null when nothing recognisable is stored. */
export function parseStoredAppearance(
  raw: string | null,
  product: Product
): Partial<Appearance> | null {
  if (!raw) return null;
  try {
    const parsed = normalizePartial(JSON.parse(raw), product);
    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * The personal preference, or null when this person has never chosen.
 * Returning null rather than a filled-in default is load-bearing: the org
 * default only applies to people who have not chosen, and "never chose" must
 * not look like "chose the defaults".
 */
export function readAppearance(product: Product): Partial<Appearance> | null {
  return parseStoredAppearance(readStoredAppearance(product), product);
}

export function writeAppearance(product: Product, next: Partial<Appearance>): void {
  writeLocal(product.storageKey, JSON.stringify(normalizePartial(next, product)));
}

/** Forget the personal preference, handing the decision back to the org or the product. */
export function clearAppearance(product: Product): void {
  writeLocal(product.storageKey, null);
}

/** The preference as an app's server holds it; an empty object means never chosen. */
export function appearanceFromServer(raw: unknown, product: Product): Partial<Appearance> | null {
  const parsed = normalizePartial(raw, product);
  return Object.keys(parsed).length > 0 ? parsed : null;
}

/** The tokens a custom accent sets inline, because it has no CSS block. */
export const CUSTOM_ACCENT_PROPERTIES = ["--brand-primary", "--brand-on-primary"] as const;

/** Stamp the axes onto <html> (or `root`). Safe to call before React hydrates. */
export function applyAppearance(value: Appearance, product: Product, root?: HTMLElement): void {
  const el = root ?? document.documentElement;
  el.dataset.product = product.id;
  el.dataset.ground = value.ground;
  el.dataset.mode = modeFor(value.ground);
  if (isCustomAccent(value.accent)) {
    el.dataset.accent = "custom";
    el.style.setProperty("--brand-primary", value.accent);
    el.style.setProperty("--brand-on-primary", inkFor(value.accent));
  } else {
    el.dataset.accent = value.accent;
    for (const property of CUSTOM_ACCENT_PROPERTIES) el.style.removeProperty(property);
  }
  el.dataset.density = value.density;
  el.style.setProperty("--radius", `${value.corners}px`);
}
