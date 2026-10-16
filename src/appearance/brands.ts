import type { ProductConfig } from "./product.js";

/**
 * The two consoles' brands, kept here so both apps and the catalog read the
 * same values. An app adds its navigation:
 *
 *   export const astrolift = defineProduct({ ...astroliftBrand, nav: NAV });
 */

/**
 * Astrolift AI: leaf green on the deep planet green sidebar. Graphite is the
 * shipped dark ground (Astrolift #2286), with mist for people whose system
 * runs light. The named themes are Astrolift's picker presets.
 */
export const astroliftBrand = {
  id: "astrolift",
  name: "Astrolift AI",
  accent: "green",
  sidebar: "#04231a",
  grounds: ["black", "charcoal", "graphite", "emerald", "paper", "mist"],
  defaultGround: { dark: "graphite", light: "mist" },
  themes: [
    { id: "orbit", name: "Orbit", hint: "Black · green", ground: "black", accent: "green" },
    { id: "forge", name: "Forge", hint: "Black · copper", ground: "black", accent: "copper" },
    { id: "console", name: "Console", hint: "Charcoal · ice", ground: "charcoal", accent: "ice" },
    {
      id: "dusk",
      name: "Dusk",
      hint: "Charcoal · periwinkle",
      ground: "charcoal",
      accent: "periwinkle",
    },
    {
      id: "graphite",
      name: "Graphite",
      hint: "Graphite · green",
      ground: "graphite",
      accent: "green",
    },
    { id: "field", name: "Field", hint: "Emerald · green", ground: "emerald", accent: "green" },
    { id: "daylight", name: "Daylight", hint: "Mist · green", ground: "mist", accent: "green" },
    { id: "workshop", name: "Workshop", hint: "Paper · copper", ground: "paper", accent: "copper" },
  ],
} as const satisfies ProductConfig;

/**
 * Zentinelle AI: teal on the navy sidebar, on a true black ground
 * (ui-overhaul-ia §5). The family accents stay selectable beside teal. The
 * emerald ground is Astrolift's planet green and is not offered.
 */
export const zentinelleBrand = {
  id: "zentinelle",
  name: "Zentinelle AI",
  accent: {
    key: "teal",
    label: "Teal",
    dark: "#37efed",
    onDark: "#0b0b19",
    light: "#0d7470",
    onLight: "#f3fbf7",
  },
  sidebar: "#0b0b19",
  grounds: ["black", "charcoal", "graphite", "paper", "mist"],
  defaultGround: { dark: "black", light: "mist" },
} as const satisfies ProductConfig;
