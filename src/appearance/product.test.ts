import { describe, expect, it } from "vitest";

import { astroliftBrand, zentinelleBrand } from "./brands.js";
import { defineProduct } from "./product.js";

describe("defineProduct", () => {
  it("fills Astrolift's defaults: every ground, the family accents, graphite and mist", () => {
    const product = defineProduct(astroliftBrand);
    expect(product.storageKey).toBe("astrolift.appearance");
    expect(product.grounds).toHaveLength(6);
    expect(product.accents.map((a) => a.key)).toEqual([
      "green",
      "copper",
      "ice",
      "periwinkle",
      "amber",
    ]);
    expect(product.brandAccent).toBeNull();
    expect(product.defaults).toEqual({
      ground: { dark: "graphite", light: "mist" },
      accent: "green",
      density: "compact",
      corners: 2,
    });
    expect(product.themes.map((t) => t.id)).toContain("daylight");
  });

  it("puts Zentinelle's teal first, keeps the family accents, and drops the emerald ground", () => {
    const product = defineProduct(zentinelleBrand);
    expect(product.accents.map((a) => a.key)).toEqual([
      "teal",
      "green",
      "copper",
      "ice",
      "periwinkle",
      "amber",
    ]);
    expect(product.accents[0]).toMatchObject({ brand: true, dark: "#37efed" });
    expect(product.grounds).not.toContain("emerald");
    expect(product.defaults.ground).toEqual({ dark: "black", light: "mist" });
    expect(product.defaults.accent).toBe("teal");
  });

  it("derives the default grounds from the offered list when none are given", () => {
    const product = defineProduct({
      id: "lab",
      name: "Lab",
      accent: "ice",
      sidebar: "#101010",
      grounds: ["charcoal", "paper"],
    });
    expect(product.defaults.ground).toEqual({ dark: "charcoal", light: "paper" });
  });

  it.each([
    [{ id: "Bad Id" }, /lowercase slug/],
    [{ sidebar: "#FFF" }, /sidebar must be lowercase #rrggbb/],
    [{ sidebar: "red;}body{x:y" }, /sidebar/],
    [{ grounds: ["black"] }, /offer a light ground/],
    [{ defaultGround: { dark: "paper", light: "mist" } }, /dark ground paper is a light ground/],
    [
      { defaultGround: { dark: "emerald", light: "mist" }, grounds: ["black", "mist"] },
      /not offered/,
    ],
    [{ accent: "magenta" }, /unknown accent/],
    [
      {
        accent: {
          key: "green",
          label: "G",
          dark: "#000000",
          onDark: "#ffffff",
          light: "#000000",
          onLight: "#ffffff",
        },
      },
      /taken by the family/,
    ],
    [
      {
        accent: {
          key: "teal",
          label: "T",
          dark: "#37EFED",
          onDark: "#000000",
          light: "#000000",
          onLight: "#ffffff",
        },
      },
      /dark must be lowercase/,
    ],
    [
      {
        themes: [{ id: "x", name: "X", hint: "", ground: "emerald", accent: "green" }],
        grounds: ["black", "mist"],
      },
      /not offered/,
    ],
    [{ defaultCorners: 3 as never }, /corners must be one of/],
  ])("refuses %o", (override, message) => {
    expect(() =>
      defineProduct({
        id: "lab",
        name: "Lab",
        accent: "green",
        sidebar: "#101010",
        ...(override as object),
      })
    ).toThrow(message);
  });
});
