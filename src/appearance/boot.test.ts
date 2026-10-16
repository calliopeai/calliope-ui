import { afterEach, describe, expect, it } from "vitest";

import { applyAppearance, readAppearance, resolveAppearance } from "./appearance.js";
import { appearanceScript, productStyles } from "./boot.js";
import { astroliftBrand, zentinelleBrand } from "./brands.js";
import { type Product, defineProduct } from "./product.js";

const PRODUCTS: Product[] = [defineProduct(astroliftBrand), defineProduct(zentinelleBrand)];

/** What a stamp put on an element, in comparable form. */
function stamp(el: HTMLElement) {
  return {
    data: { ...el.dataset },
    radius: el.style.getPropertyValue("--radius"),
    primary: el.style.getPropertyValue("--brand-primary"),
    onPrimary: el.style.getPropertyValue("--brand-on-primary"),
  };
}

function setSystem(mode: "dark" | "light") {
  window.matchMedia = ((query: string) => ({
    matches: mode === "light" && query.includes("light"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const STORED: (string | null)[] = [
  null,
  "{not json",
  JSON.stringify({}),
  JSON.stringify({ ground: "paper" }),
  JSON.stringify({ ground: "emerald", accent: "copper" }),
  JSON.stringify({ accent: "teal" }),
  JSON.stringify({ accent: "#d94f8a", ground: "black" }),
  JSON.stringify({ accent: "#d94f8a", ground: "paper" }),
  JSON.stringify({ accent: "#e8e0ff" }),
  JSON.stringify({ density: "cards", corners: 10 }),
  JSON.stringify({ density: "roomy", corners: 3, ground: 7 }),
  JSON.stringify({ ground: "mist", accent: "amber", density: "compact", corners: 0 }),
];

/**
 * The boot script is the TypeScript resolution written a second time, in
 * ES5, so it can run before any bundle. This holds the two to the same
 * answer for every product, stored preference and system mode.
 */
describe.each(PRODUCTS)("boot script for $name", (product) => {
  describe.each(["dark", "light"] as const)("with a %s system", (system) => {
    it.each(STORED)("stamps what the provider would for %s", (stored) => {
      if (stored === null) window.localStorage.removeItem(product.storageKey);
      else window.localStorage.setItem(product.storageKey, stored);
      setSystem(system);

      const root = document.documentElement;
      root.removeAttribute("style");
      for (const key of Object.keys(root.dataset)) delete root.dataset[key];
      new Function(appearanceScript(product))();
      const fromScript = stamp(root);

      const expected = document.createElement("html");
      applyAppearance(
        resolveAppearance(readAppearance(product), null, product, system).value,
        product,
        expected
      );
      expect(fromScript).toEqual(stamp(expected));
    });
  });
});

describe("appearanceScript", () => {
  it("never breaks out of its <script> element", () => {
    const script = appearanceScript(PRODUCTS[0]!);
    expect(script).not.toMatch(/<\/script/i);
    expect(script.startsWith("try{")).toBe(true);
  });

  it("leaves the page alone when storage throws", () => {
    const product = PRODUCTS[1]!;
    const original = Object.getOwnPropertyDescriptor(window, "localStorage")!;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("denied", "SecurityError");
      },
    });
    try {
      new Function(appearanceScript(product))();
      expect(document.documentElement.dataset.ground).toBe("black");
      expect(document.documentElement.dataset.accent).toBe("teal");
    } finally {
      Object.defineProperty(window, "localStorage", original);
    }
  });
});

describe("productStyles", () => {
  it("is the product's brand CSS", () => {
    expect(productStyles(PRODUCTS[1]!)).toContain('[data-mode="dark"][data-accent="teal"]');
  });
});
