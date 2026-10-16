import { describe, expect, it } from "vitest";

import { astroliftBrand, zentinelleBrand } from "../appearance/brands.js";
import { defineProduct } from "../appearance/product.js";
import { PILL_TINT } from "../status/tones.js";
import { MIN_NON_TEXT_CONTRAST, MIN_TEXT_CONTRAST, contrastRatio, luminance } from "./contrast.js";
import {
  ACCENTS,
  ACCENT_KEYS,
  GROUND_KEYS,
  GROUNDS,
  MODE_TOKENS,
  SURFACES,
  type StatusName,
} from "./tokens.js";

/** An `#rrggbb` colour at `alpha` over a solid one, as the screen shows it. */
function over(colour: string, alpha: number, base: string): string {
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const top = channels(colour);
  const bottom = channels(base);
  return `#${top
    .map((c, i) =>
      Math.round(c * alpha + bottom[i]! * (1 - alpha))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

const products = [defineProduct(astroliftBrand), defineProduct(zentinelleBrand)];
const STATUS: StatusName[] = ["success", "warning", "info", "danger"];

describe("contrast math", () => {
  it("matches WCAG at the ends", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
  });
});

/**
 * Every theme is checked, not just the default one: every ground with every
 * accent, the status colours on every ground, and both products' brand
 * surfaces. A token change that breaks a pairing fails here.
 */
describe.each(GROUND_KEYS)("ground %s", (ground) => {
  const surfaces = SURFACES[ground];
  const mode = GROUNDS[ground].mode;
  const tokens = MODE_TOKENS[mode];
  const panels = {
    background: surfaces.background,
    card: surfaces.card,
    popover: surfaces.popover,
  };

  it.each(Object.entries(panels))("body text reads on %s", (_name, panel) => {
    expect(contrastRatio(tokens.foreground, panel)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(surfaces.mutedForeground, panel)).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST
    );
  });

  it.each(ACCENT_KEYS)(
    "the %s accent stands 3:1 off the ground, and its ink reads on it",
    (key) => {
      const accent = ACCENTS[key];
      const colour = mode === "dark" ? accent.dark : accent.light;
      const ink = mode === "dark" ? accent.onDark : accent.onLight;
      expect(contrastRatio(colour, surfaces.background)).toBeGreaterThanOrEqual(
        MIN_NON_TEXT_CONTRAST
      );
      expect(contrastRatio(ink, colour)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  );

  it.each(STATUS)("%s: its dot stands 3:1 off the ground and its pill text reads", (name) => {
    const status = tokens.status[name];
    expect(contrastRatio(status.base, surfaces.background)).toBeGreaterThanOrEqual(
      MIN_NON_TEXT_CONTRAST
    );
    for (const panel of [surfaces.background, surfaces.card]) {
      const pill = over(status.base, PILL_TINT, panel);
      expect(contrastRatio(status.fg, pill)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  });

  it("destructive text reads on its tint, on every surface a button or menu item sits on", () => {
    const danger = tokens.status.danger;
    for (const panel of [surfaces.background, surfaces.card, surfaces.popover]) {
      // The button's rest and hover tints, and a menu item's focus tint.
      for (const tint of [0.1, 0.15]) {
        expect(contrastRatio(danger.fg, over(danger.base, tint, panel))).toBeGreaterThanOrEqual(
          MIN_TEXT_CONTRAST
        );
      }
    }
  });

  it.each(products)("$name: its accent and sidebar work on this ground", (product) => {
    for (const accent of product.accents) {
      const colour = mode === "dark" ? accent.dark : accent.light;
      expect(contrastRatio(colour, surfaces.background)).toBeGreaterThanOrEqual(
        MIN_NON_TEXT_CONTRAST
      );
      expect(
        contrastRatio(mode === "dark" ? accent.onDark : accent.onLight, colour)
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
    const sidebar = surfaces.sidebar === "brand" ? product.sidebar : surfaces.sidebar;
    expect(contrastRatio(tokens.sidebarForeground, sidebar)).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST
    );
    expect(contrastRatio(surfaces.mutedForeground, sidebar)).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST
    );
  });
});
