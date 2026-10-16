import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { astroliftBrand, zentinelleBrand } from "../appearance/brands.js";
import { defineProduct } from "../appearance/product.js";
import { renderProductCss, renderThemeCss } from "./css.js";
import { ACCENT_KEYS, GROUND_KEYS, GROUNDS } from "./tokens.js";

// Not `new URL(..., import.meta.url)`: Vite rewrites that into an asset URL.
const here = path.dirname(fileURLToPath(import.meta.url));
const committed = readFileSync(path.join(here, "../styles/theme.css"), "utf8");

/** Every rule of a flat stylesheet: its selector and its declarations. */
function rules(css: string): { selector: string; properties: string[] }[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
    selector: (m[1] ?? "").trim().replace(/\s+/g, " "),
    properties: (m[2] ?? "")
      .split(";")
      .map((d) => d.split(":")[0]?.trim() ?? "")
      .filter(Boolean),
  }));
}

const STATUS = /^--(success|warning|info|danger)(-fg|-bg|-border)?$/;

describe("theme.css", () => {
  it("is exactly what the token table generates (run `npm run theme` after a token change)", () => {
    expect(committed).toBe(renderThemeCss());
  });

  it("has a block for every ground in its own mode, and for every accent in both modes", () => {
    const selectors = rules(committed).map((r) => r.selector);
    for (const ground of GROUND_KEYS) {
      expect(selectors).toContain(`[data-mode="${GROUNDS[ground].mode}"][data-ground="${ground}"]`);
    }
    for (const accent of ACCENT_KEYS) {
      expect(selectors).toContain(`[data-mode="dark"][data-accent="${accent}"]`);
      expect(selectors).toContain(`[data-mode="light"][data-accent="${accent}"]`);
    }
  });

  it("defines status only per mode: no ground, accent or density block may touch it", () => {
    for (const rule of rules(committed)) {
      const statusProperties = rule.properties.filter((p) => STATUS.test(p));
      const isModeBlock =
        rule.selector === ':root, [data-mode="dark"]' || rule.selector === '[data-mode="light"]';
      if (isModeBlock) expect(statusProperties).toHaveLength(16);
      else expect(statusProperties, rule.selector).toEqual([]);
    }
  });

  it("lets an accent block set only the accent and the chart series it displaces", () => {
    for (const rule of rules(committed).filter((r) => r.selector.includes("data-accent"))) {
      for (const property of rule.properties) {
        expect(property, rule.selector).toMatch(/^--(brand-primary|brand-on-primary|chart-[2-5])$/);
      }
    }
  });

  it("gives every density block the same variables", () => {
    const density = rules(committed).filter((r) => r.selector.includes("data-density"));
    expect(density).toHaveLength(2);
    expect(density[0]!.properties).toEqual(density[1]!.properties);
  });
});

describe("product css", () => {
  it("sets the brand sidebar, and a brand accent's two modes, nothing else", () => {
    const zentinelle = defineProduct(zentinelleBrand);
    expect(rules(renderProductCss(zentinelle))).toEqual([
      { selector: ":root", properties: ["--brand-sidebar"] },
      {
        selector: '[data-mode="dark"][data-accent="teal"]',
        properties: ["--brand-primary", "--brand-on-primary"],
      },
      {
        selector: '[data-mode="light"][data-accent="teal"]',
        properties: ["--brand-primary", "--brand-on-primary"],
      },
    ]);
    expect(renderProductCss(zentinelle)).toContain("--brand-sidebar:#0b0b19");
    expect(renderProductCss(zentinelle)).toContain("--brand-primary:#37efed");
  });

  it("adds no accent rule for a product on a family accent", () => {
    const astrolift = defineProduct(astroliftBrand);
    expect(renderProductCss(astrolift)).toBe(":root{--brand-sidebar:#04231a}");
  });
});
