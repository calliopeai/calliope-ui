import { afterEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORE_EVENT } from "../lib/local-store.js";
import {
  accentContrast,
  appearanceFromServer,
  applyAppearance,
  clearAppearance,
  inkFor,
  normalize,
  normalizePartial,
  parseCustomAccent,
  readAppearance,
  resolveAppearance,
  writeAppearance,
} from "./appearance.js";
import { astroliftBrand, zentinelleBrand } from "./brands.js";
import { defineProduct } from "./product.js";

const astrolift = defineProduct(astroliftBrand);
const zentinelle = defineProduct(zentinelleBrand);
const DEFAULT = { ground: "graphite", accent: "green", density: "compact", corners: 2 } as const;

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * The precedence rule is the point of the org policy: locked org theme >
 * personal > org default > product default. Ported from Astrolift's tests,
 * which guard the regression where "never chose" looked like "chose the
 * defaults" and the org default silently applied to nobody.
 */
describe("resolveAppearance precedence", () => {
  const orgTheme = { ground: "charcoal", accent: "copper" } as const;

  it("falls back to the product default with no policy and no preference", () => {
    expect(resolveAppearance(null, null, astrolift)).toEqual({
      value: DEFAULT,
      mode: "dark",
      locked: false,
    });
  });

  it("follows the system's light or dark until a ground is chosen", () => {
    expect(resolveAppearance(null, null, astrolift, "light").value.ground).toBe("mist");
    expect(resolveAppearance(null, null, astrolift, "light").mode).toBe("light");
    expect(resolveAppearance({ ground: "black" }, null, astrolift, "light").value.ground).toBe(
      "black"
    );
  });

  it("applies the org default when the person has never chosen", () => {
    const { value } = resolveAppearance(null, { orgDefault: orgTheme }, astrolift);
    expect(value).toEqual({ ...DEFAULT, ...orgTheme });
  });

  it("lets a personal choice beat the org default, axis by axis", () => {
    const { value, locked } = resolveAppearance(
      { accent: "ice" },
      { orgDefault: orgTheme },
      astrolift
    );
    expect(value.accent).toBe("ice");
    expect(value.ground).toBe("charcoal");
    expect(locked).toBe(false);
  });

  it("lets a locked org theme beat a personal choice", () => {
    const { value, locked } = resolveAppearance(
      { accent: "ice", ground: "paper" },
      { orgDefault: orgTheme, locked: true },
      astrolift
    );
    expect(value).toEqual({ ...DEFAULT, ...orgTheme });
    expect(locked).toBe(true);
  });

  it("locks to the product default when locked with no org theme", () => {
    expect(resolveAppearance({ accent: "ice" }, { locked: true }, astrolift).value).toEqual(
      DEFAULT
    );
  });

  it("ignores an org default the product cannot show", () => {
    // Zentinelle offers no emerald ground; Astrolift has no teal accent.
    expect(
      resolveAppearance(null, { orgDefault: { ground: "emerald" } }, zentinelle).value.ground
    ).toBe("black");
    expect(
      resolveAppearance(null, { orgDefault: { accent: "teal" } }, astrolift).value.accent
    ).toBe("green");
  });
});

describe("normalizePartial", () => {
  it("keeps a partial partial", () => {
    expect(normalizePartial({ accent: "copper" }, astrolift)).toEqual({ accent: "copper" });
  });

  it("drops unknown keys and values instead of defaulting them", () => {
    expect(normalizePartial({ accent: "purple", ground: "black", nope: 1 }, astrolift)).toEqual({
      ground: "black",
    });
  });

  it("drops what this product does not offer", () => {
    expect(normalizePartial({ ground: "emerald", accent: "teal" }, zentinelle)).toEqual({
      accent: "teal",
    });
    expect(normalizePartial({ accent: "teal" }, astrolift)).toEqual({});
  });

  it("returns an empty object for junk", () => {
    expect(normalizePartial("black", astrolift)).toEqual({});
    expect(normalizePartial(null, astrolift)).toEqual({});
  });

  it("differs from normalize, which always fills every axis", () => {
    expect(Object.keys(normalize({ accent: "copper" }, astrolift)).sort()).toEqual([
      "accent",
      "corners",
      "density",
      "ground",
    ]);
  });
});

describe("readAppearance", () => {
  it("returns null when nothing has ever been stored", () => {
    expect(readAppearance(astrolift)).toBeNull();
  });

  it("returns null for a stored value with no recognisable axes, or malformed JSON", () => {
    window.localStorage.setItem(astrolift.storageKey, JSON.stringify({ accent: "purple" }));
    expect(readAppearance(astrolift)).toBeNull();
    window.localStorage.setItem(astrolift.storageKey, "{not json");
    expect(readAppearance(astrolift)).toBeNull();
  });

  it("returns only the axes that were stored", () => {
    writeAppearance(astrolift, { accent: "copper" });
    expect(readAppearance(astrolift)).toEqual({ accent: "copper" });
  });

  it("keeps each product's preference apart", () => {
    writeAppearance(astrolift, { accent: "copper" });
    writeAppearance(zentinelle, { accent: "teal" });
    expect(readAppearance(astrolift)).toEqual({ accent: "copper" });
    expect(readAppearance(zentinelle)).toEqual({ accent: "teal" });
  });

  it("lets the org default through end to end when nothing is set", () => {
    const policy = { orgDefault: { accent: "copper" } as const };
    expect(resolveAppearance(readAppearance(astrolift), policy, astrolift).value.accent).toBe(
      "copper"
    );
    writeAppearance(astrolift, { accent: "ice" });
    expect(resolveAppearance(readAppearance(astrolift), policy, astrolift).value.accent).toBe(
      "ice"
    );
    clearAppearance(astrolift);
    expect(resolveAppearance(readAppearance(astrolift), policy, astrolift).value.accent).toBe(
      "copper"
    );
  });

  it("announces every write, so providers in this tab follow", () => {
    const heard = vi.fn();
    window.addEventListener(LOCAL_STORE_EVENT, heard);
    writeAppearance(astrolift, { density: "cards" });
    clearAppearance(astrolift);
    window.removeEventListener(LOCAL_STORE_EVENT, heard);
    expect(heard).toHaveBeenCalledTimes(2);
  });

  it("still applies a choice for this page when storage refuses the write", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    writeAppearance(astrolift, { accent: "amber" });
    expect(readAppearance(astrolift)).toEqual({ accent: "amber" });
    vi.restoreAllMocks();
    clearAppearance(astrolift);
    expect(readAppearance(astrolift)).toBeNull();
  });
});

/** Any colour as the accent, as long as it can be seen on the ground it lands on. */
describe("custom accent", () => {
  it("parses the forms people type into one stored shape", () => {
    expect(parseCustomAccent("#2F9E52")).toBe("#2f9e52");
    expect(parseCustomAccent("2f9e52")).toBe("#2f9e52");
    expect(parseCustomAccent("#abc")).toBe("#aabbcc");
    expect(parseCustomAccent("green")).toBeNull();
    expect(parseCustomAccent("#12345")).toBeNull();
  });

  it("holds a custom accent to 3:1 against the ground", () => {
    expect(accentContrast("#2f9e52", "black").ok).toBe(true);
    expect(accentContrast("#101010", "black").ok).toBe(false);
    expect(accentContrast("#f0e68c", "paper").ok).toBe(false);
  });

  it("falls back to the product accent on a ground it cannot be read on", () => {
    expect(normalize({ ground: "black", accent: "#e8e0ff" }, astrolift).accent).toBe("#e8e0ff");
    expect(normalize({ ground: "paper", accent: "#e8e0ff" }, astrolift).accent).toBe("green");
    expect(normalize({ ground: "paper", accent: "#e8e0ff" }, zentinelle).accent).toBe("teal");
  });

  it("picks the ink with more contrast for text on the accent", () => {
    expect(inkFor("#f0e68c")).toBe("#000000");
    expect(inkFor("#1a237e")).toBe("#ffffff");
  });
});

describe("appearanceFromServer", () => {
  it("reads the server's empty appearance as never chosen", () => {
    expect(appearanceFromServer({}, astrolift)).toBeNull();
    expect(appearanceFromServer(null, astrolift)).toBeNull();
  });

  it("keeps the server's partial partial, dropping what this build does not know", () => {
    expect(
      appearanceFromServer({ accent: "ice", ground: "sepia", sparkle: true }, astrolift)
    ).toEqual({ accent: "ice" });
  });
});

describe("applyAppearance", () => {
  it("stamps every axis, the mode the ground implies, and the product", () => {
    const el = document.createElement("html");
    applyAppearance(
      { ground: "paper", accent: "copper", density: "cards", corners: 10 },
      astrolift,
      el
    );
    expect({ ...el.dataset }).toEqual({
      product: "astrolift",
      ground: "paper",
      mode: "light",
      accent: "copper",
      density: "cards",
    });
    expect(el.style.getPropertyValue("--radius")).toBe("10px");
  });

  it("paints only the action tokens inline for a custom accent, and clears them for a preset", () => {
    const el = document.createElement("html");
    applyAppearance({ ...DEFAULT, ground: "black", accent: "#d94f8a" }, astrolift, el);
    expect(el.dataset.accent).toBe("custom");
    expect(el.style.getPropertyValue("--brand-primary")).toBe("#d94f8a");
    expect(el.style.getPropertyValue("--brand-on-primary")).toBe("#000000");
    expect(el.style.getPropertyValue("--success")).toBe("");
    applyAppearance({ ...DEFAULT, accent: "ice" }, astrolift, el);
    expect(el.dataset.accent).toBe("ice");
    expect(el.style.getPropertyValue("--brand-primary")).toBe("");
  });
});
