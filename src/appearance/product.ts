import type { NavModel } from "../nav/model.js";
import {
  ACCENTS,
  ACCENT_KEYS,
  GROUNDS,
  GROUND_KEYS,
  type Density,
  type FamilyAccent,
  type Ground,
  type Mode,
} from "../theme/tokens.js";

export type Corners = 0 | 2 | 4 | 10;
export const CORNERS: readonly Corners[] = [0, 2, 4, 10];

/** A product's own accent, offered first in the picker (Zentinelle teal). */
export interface BrandAccent {
  /** Lowercase slug, stored in the preference and set as `data-accent`. */
  key: string;
  label: string;
  /** The accent on dark grounds, and the ink on it. */
  dark: string;
  onDark: string;
  /** The accent on light grounds, and the ink on it. */
  light: string;
  onLight: string;
}

/** A named ground and accent, so the picker offers a decision rather than two lists. */
export interface ProductTheme {
  id: string;
  name: string;
  hint: string;
  ground: Ground;
  accent: string;
}

/**
 * Everything that makes one console look like itself: its name, its accent,
 * its sidebar and its navigation. The family palette, the status colours and
 * the layout are shared.
 */
export interface ProductConfig {
  /** Lowercase slug: the storage namespace and `data-product` on <html>. */
  id: string;
  /** The full product name, as the brand mark shows it ("Astrolift AI"). */
  name: string;
  /** The default accent: a family accent, or the product's own. */
  accent: FamilyAccent | BrandAccent;
  /** The brand surface: the sidebar on dark grounds (graphite and light grounds stay neutral). */
  sidebar: string;
  /** The grounds offered, in picker order. All six when absent. */
  grounds?: readonly Ground[];
  /** The ground until someone chooses: one per mode, following the operating system. */
  defaultGround?: { dark: Ground; light: Ground };
  defaultDensity?: Density;
  defaultCorners?: Corners;
  themes?: readonly ProductTheme[];
  /** The navigation model, before it is filtered by what the viewer may open. */
  nav?: NavModel;
}

export interface ProductAccent {
  key: string;
  label: string;
  dark: string;
  onDark: string;
  light: string;
  onLight: string;
  /** True for the product's own accent. */
  brand: boolean;
}

/** A validated product config with its defaults filled in. */
export interface Product {
  id: string;
  name: string;
  sidebar: string;
  grounds: readonly Ground[];
  /** The product's accent first, then the family accents. */
  accents: readonly ProductAccent[];
  /** The product's own accent when it has one; null when it uses a family accent. */
  brandAccent: BrandAccent | null;
  defaults: {
    ground: Record<Mode, Ground>;
    accent: string;
    density: Density;
    corners: Corners;
  };
  themes: readonly ProductTheme[];
  nav: NavModel;
  /** localStorage key of the personal appearance preference. */
  storageKey: string;
}

const SLUG = /^[a-z][a-z0-9-]*$/;
const HEX = /^#[0-9a-f]{6}$/;

function fail(product: string, message: string): never {
  throw new Error(`@calliopelabs/ui: product "${product}": ${message}`);
}

/**
 * Validate a product config and fill in its defaults. Throws on anything
 * that would paint wrong or inject into the generated CSS: a key that is not
 * a slug, a colour that is not lowercase `#rrggbb`, a default ground the
 * product does not offer, or a default ground of the wrong mode.
 */
export function defineProduct(config: ProductConfig): Product {
  const { id } = config;
  if (!SLUG.test(id)) fail(id, "id must be a lowercase slug");
  if (!config.name.trim()) fail(id, "name is required");
  if (!HEX.test(config.sidebar))
    fail(id, `sidebar must be lowercase #rrggbb, got ${config.sidebar}`);

  const grounds = config.grounds ? [...config.grounds] : [...GROUND_KEYS];
  if (grounds.length === 0) fail(id, "offer at least one ground");
  for (const ground of grounds) {
    if (!(ground in GROUNDS)) fail(id, `unknown ground ${ground}`);
  }

  const defaultGround = config.defaultGround ?? {
    dark: grounds.find((g) => GROUNDS[g].mode === "dark") ?? fail(id, "offer a dark ground"),
    light: grounds.find((g) => GROUNDS[g].mode === "light") ?? fail(id, "offer a light ground"),
  };
  for (const mode of ["dark", "light"] as const) {
    const ground = defaultGround[mode];
    if (!grounds.includes(ground)) fail(id, `default ${mode} ground ${ground} is not offered`);
    if (GROUNDS[ground].mode !== mode)
      fail(id, `default ${mode} ground ${ground} is a ${GROUNDS[ground].mode} ground`);
  }

  const family: ProductAccent[] = ACCENT_KEYS.map((key) => ({
    key,
    ...ACCENTS[key],
    brand: false,
  }));
  let brandAccent: BrandAccent | null = null;
  if (typeof config.accent === "string") {
    if (!(config.accent in ACCENTS)) fail(id, `unknown accent ${config.accent}`);
  } else {
    brandAccent = config.accent;
    if (!SLUG.test(brandAccent.key)) fail(id, "brand accent key must be a lowercase slug");
    if (brandAccent.key in ACCENTS || brandAccent.key === "custom") {
      fail(id, `brand accent key ${brandAccent.key} is taken by the family`);
    }
    for (const field of ["dark", "onDark", "light", "onLight"] as const) {
      if (!HEX.test(brandAccent[field]))
        fail(id, `brand accent ${field} must be lowercase #rrggbb`);
    }
  }
  const accents: ProductAccent[] = brandAccent
    ? [{ ...brandAccent, brand: true }, ...family]
    : family;
  const defaultAccent = typeof config.accent === "string" ? config.accent : config.accent.key;

  const density = config.defaultDensity ?? "compact";
  if (density !== "compact" && density !== "cards") fail(id, `unknown density ${String(density)}`);
  const corners = config.defaultCorners ?? 2;
  if (!CORNERS.includes(corners)) fail(id, `corners must be one of ${CORNERS.join(", ")}`);

  const themes = config.themes ?? [];
  for (const theme of themes) {
    if (!grounds.includes(theme.ground))
      fail(id, `theme ${theme.id} uses ground ${theme.ground}, which is not offered`);
    if (!accents.some((a) => a.key === theme.accent))
      fail(id, `theme ${theme.id} uses unknown accent ${theme.accent}`);
  }

  return {
    id,
    name: config.name,
    sidebar: config.sidebar,
    grounds,
    accents,
    brandAccent,
    defaults: {
      ground: defaultGround,
      accent: defaultAccent,
      density,
      corners,
    },
    themes,
    nav: config.nav ?? [],
    storageKey: `${id}.appearance`,
  };
}
