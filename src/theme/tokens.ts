/**
 * The Calliope AI operator palette: one table, and the source of
 * `src/styles/theme.css` (`npm run theme`). Every value here is either a
 * ground (the surface ramp), a family accent (action colour and the lead
 * chart series), a semantic status, or a density step.
 *
 * Values come from the Astrolift frontend (`app/globals.css`, origin/main
 * 8edb40d) and the operator-UI amendment of 2026-08-21: grounds are black
 * and neutral, the sidebar is the one brand surface, corners are 2px, a
 * second hue is allowed as accent, and semantic status never moves with the
 * accent or the ground's tint. Astrolift's light values were oklch; they are
 * stored here as the sRGB they render to, so the contrast tests can read
 * them. One value changed on the way: light `warning` went from
 * oklch(0.66 0.16 70) to oklch(0.65 0.16 70) so a warning dot clears 3:1 on
 * paper and mist.
 */

export type Mode = "dark" | "light";

export const GROUNDS = {
  black: { label: "Black", mode: "dark" },
  charcoal: { label: "Charcoal", mode: "dark" },
  graphite: { label: "Graphite", mode: "dark" },
  emerald: { label: "Emerald", mode: "dark" },
  paper: { label: "Paper", mode: "light" },
  mist: { label: "Mist", mode: "light" },
} as const satisfies Record<string, { label: string; mode: Mode }>;

export type Ground = keyof typeof GROUNDS;

export const GROUND_KEYS = Object.keys(GROUNDS) as Ground[];

/**
 * The surfaces a ground paints. `sidebar: "brand"` means the product's brand
 * surface (`--brand-sidebar`, set by the product), falling back to the
 * ground's own card colour when no product is set. Graphite and the light
 * grounds keep a neutral sidebar whatever the product, so the brand colour
 * is spent on the accent there (Astrolift #2286).
 */
export interface Surfaces {
  background: string;
  card: string;
  popover: string;
  secondary: string;
  muted: string;
  /** shadcn's name for the hover and selected surface, not the brand accent. */
  accent: string;
  mutedForeground: string;
  border: string;
  input: string;
  sidebar: "brand" | string;
  sidebarAccent: string;
  sidebarBorder: string;
}

const PRIMARY_TINT_16 = "color-mix(in oklab, var(--primary) 16%, transparent)";
const PRIMARY_TINT_14 = "color-mix(in oklab, var(--primary) 14%, transparent)";

export const SURFACES: Record<Ground, Surfaces> = {
  black: {
    background: "#000000",
    card: "#0a0a0a",
    popover: "#141414",
    secondary: "#161616",
    muted: "#111111",
    accent: "#1b1b1b",
    mutedForeground: "#848b88",
    border: "rgba(255, 255, 255, 0.1)",
    input: "rgba(255, 255, 255, 0.1)",
    sidebar: "brand",
    sidebarAccent: PRIMARY_TINT_16,
    sidebarBorder: "rgba(255, 255, 255, 0.08)",
  },
  charcoal: {
    background: "#0e0f10",
    card: "#161819",
    popover: "#1e2022",
    secondary: "#202325",
    muted: "#191b1c",
    accent: "#232628",
    mutedForeground: "#8b9194",
    border: "rgba(255, 255, 255, 0.1)",
    input: "rgba(255, 255, 255, 0.1)",
    sidebar: "brand",
    sidebarAccent: PRIMARY_TINT_16,
    sidebarBorder: "rgba(255, 255, 255, 0.08)",
  },
  graphite: {
    background: "#111214",
    card: "#18191b",
    popover: "#202124",
    secondary: "#222326",
    muted: "#1b1c1e",
    accent: "#26272a",
    mutedForeground: "#8e9296",
    border: "rgba(255, 255, 255, 0.09)",
    input: "rgba(255, 255, 255, 0.1)",
    sidebar: "#161719",
    sidebarAccent: PRIMARY_TINT_14,
    sidebarBorder: "rgba(255, 255, 255, 0.07)",
  },
  emerald: {
    background: "#050b08",
    card: "#0a1310",
    popover: "#0d1814",
    secondary: "#121d18",
    muted: "#101a15",
    accent: "#16261f",
    mutedForeground: "#8ba199",
    border: "rgba(255, 255, 255, 0.1)",
    input: "rgba(255, 255, 255, 0.1)",
    sidebar: "brand",
    sidebarAccent: PRIMARY_TINT_16,
    sidebarBorder: "rgba(255, 255, 255, 0.08)",
  },
  paper: {
    background: "#faf6ee",
    card: "#fffdf9",
    popover: "#fffdf9",
    secondary: "#f3eee4",
    muted: "#f3eee4",
    accent: "#f0e6da",
    mutedForeground: "#5c5b58",
    border: "#dedad2",
    input: "#dedad2",
    sidebar: "#f5f0e4",
    sidebarAccent: "#f0e6da",
    sidebarBorder: "#dedad2",
  },
  mist: {
    background: "#f2f7f9",
    card: "#ffffff",
    popover: "#ffffff",
    secondary: "#e9eff2",
    muted: "#e9eff2",
    accent: "#dfeaf0",
    mutedForeground: "#5c5b58",
    border: "#d6dcdf",
    input: "#d6dcdf",
    sidebar: "#e9f1f5",
    sidebarAccent: "#dfeaf0",
    sidebarBorder: "#d6dcdf",
  },
};

/**
 * What a mode paints before a ground refines it: dark starts on black, light
 * on a neutral white. Every shipped ground overrides these surfaces, so the
 * light set only shows when no ground is set.
 */
export const BASE_SURFACES: Record<Mode, Surfaces> = {
  dark: SURFACES.black,
  light: {
    background: "#fafaf9",
    card: "#ffffff",
    popover: "#ffffff",
    secondary: "#f1f1f0",
    muted: "#f1f1f0",
    accent: "#f3ebe5",
    mutedForeground: "#5c5b58",
    border: "#dfdedc",
    input: "#dfdedc",
    sidebar: "#f4f3f1",
    sidebarAccent: "#f3ebe5",
    sidebarBorder: "#dfdedc",
  },
};

export type StatusName = "success" | "warning" | "info" | "danger";

/**
 * A status paints four tokens: the solid base (dots, icons, chart series),
 * `fg` (text and icons on the status tint), `bg` (a subtle callout fill) and
 * `border` (the tinted hairline). Defined per mode only: no ground and no
 * accent may redefine them. Info is green; the family permits no blue.
 */
export interface StatusTokens {
  base: string;
  fg: string;
  bg: string;
  border: string;
}

export interface ModeTokens {
  foreground: string;
  destructive: string;
  /** chart-1 is always the accent; these are series two to five. */
  chart: { "chart-2": string; "chart-3": string; "chart-4": string; "chart-5": string };
  sidebarForeground: string;
  status: Record<StatusName, StatusTokens>;
}

export const MODE_TOKENS: Record<Mode, ModeTokens> = {
  dark: {
    foreground: "#f0f2f1",
    destructive: "#ff6b6b",
    chart: {
      "chart-2": "#8fd82a",
      "chart-3": "#cbf39d",
      "chart-4": "#e0b34a",
      "chart-5": "#0b6644",
    },
    sidebarForeground: "#f0f2f1",
    status: {
      success: {
        base: "#8fd82a",
        fg: "#a6e34d",
        bg: "rgba(143, 216, 42, 0.1)",
        border: "rgba(143, 216, 42, 0.35)",
      },
      warning: {
        base: "#f0c34e",
        fg: "#f0c34e",
        bg: "rgba(240, 195, 78, 0.1)",
        border: "rgba(240, 195, 78, 0.35)",
      },
      info: {
        base: "#2f9e52",
        fg: "#5cbb79",
        bg: "rgba(47, 158, 82, 0.14)",
        border: "rgba(47, 158, 82, 0.4)",
      },
      danger: {
        base: "#ff6b6b",
        fg: "#ff8a8a",
        bg: "rgba(255, 107, 107, 0.1)",
        border: "rgba(255, 107, 107, 0.35)",
      },
    },
  },
  light: {
    foreground: "#1e1d1b",
    destructive: "#d40c1a",
    chart: {
      "chart-2": "#5c9c1a",
      "chart-3": "#8a7a5c",
      "chart-4": "#b8860b",
      "chart-5": "#26803f",
    },
    sidebarForeground: "#1e1d1b",
    status: {
      success: { base: "#508d23", fg: "#305a12", bg: "#e3f5da", border: "#b4d7a2" },
      warning: { base: "#cb7a00", fg: "#824c12", bg: "#fef0d4", border: "#e8c184" },
      info: { base: "#2f8543", fg: "#1b622d", bg: "#e2f4e3", border: "#acd8b1" },
      danger: { base: "#df2225", fg: "#bb0916", bg: "#ffeae9", border: "#ffb1aa" },
    },
  },
};

/**
 * The family accents: the action colour, focus ring and lead chart series.
 * `dark` and `light` are the accent on each mode's grounds; `onDark` and
 * `onLight` are the ink on a filled accent. A product may add its own brand
 * accent beside these (Zentinelle teal); none of them reaches status.
 */
export interface AccentSpec {
  label: string;
  dark: string;
  onDark: string;
  light: string;
  onLight: string;
  /** Chart series moved so they do not collide with this accent. */
  chart?: Partial<Record<Mode, Partial<ModeTokens["chart"]>>>;
}

export const ACCENTS = {
  green: {
    label: "Green",
    dark: "#2f9e52",
    onDark: "#04241b",
    light: "#26803f",
    onLight: "#f3fbf7",
  },
  copper: {
    label: "Copper",
    dark: "#c97b4a",
    onDark: "#140a04",
    light: "#9c5730",
    onLight: "#f3fbf7",
    chart: { dark: { "chart-3": "#d9c7a3", "chart-5": "#2f9e52" } },
  },
  ice: {
    label: "Ice",
    dark: "#6e9fc4",
    onDark: "#06131c",
    light: "#3d6f95",
    onLight: "#f3fbf7",
    chart: { dark: { "chart-3": "#b9d4e4", "chart-5": "#2f9e52" } },
  },
  periwinkle: {
    label: "Periwinkle",
    dark: "#8b8fd9",
    onDark: "#0b0c1a",
    light: "#5a5fae",
    onLight: "#f3fbf7",
    chart: { dark: { "chart-3": "#c3c5ec", "chart-5": "#2f9e52" } },
  },
  amber: {
    label: "Amber",
    dark: "#e0b34a",
    onDark: "#1a1204",
    light: "#8a6410",
    onLight: "#f3fbf7",
    // Amber is the accent here, so the amber series moves to copper.
    chart: { dark: { "chart-4": "#c97b4a" } },
  },
} as const satisfies Record<string, AccentSpec>;

export type FamilyAccent = keyof typeof ACCENTS;

export const ACCENT_KEYS = Object.keys(ACCENTS) as FamilyAccent[];

/** The accent a mode paints when nothing chooses one. */
export const DEFAULT_ACCENT: FamilyAccent = "green";

export type Density = "compact" | "cards";

/**
 * Density is a layout axis, not padding (operator-UI amendment): `compact`
 * is one panel of hairline rows, `cards` boxes items and flows them into
 * responsive columns. Components read these variables, and a subtree can
 * carry its own `data-density`, so the nearest one wins.
 */
export const DENSITIES: Record<
  Density,
  { label: string; hint: string; tokens: Record<string, string> }
> = {
  compact: {
    label: "Compact",
    hint: "Dense rows with hairline dividers",
    tokens: {
      "row-pad-y": "0.5rem",
      "row-pad-x": "0.75rem",
      "stack-gap": "0.75rem",
      "panel-pad": "1rem",
      "list-columns": "minmax(0, 1fr)",
      "list-gap": "0px",
      "list-frame-border": "1px",
      "list-frame-radius": "var(--radius)",
      "list-item-border": "0px",
      "list-item-radius": "0px",
      "list-item-bg": "transparent",
      "list-item-pad": "var(--row-pad-y) var(--row-pad-x)",
      "list-item-direction": "row",
      "list-item-align": "center",
      "list-item-trail": "auto",
    },
  },
  cards: {
    label: "Cards",
    hint: "Boxed items that flow into columns",
    tokens: {
      "row-pad-y": "0.9rem",
      "row-pad-x": "1rem",
      "stack-gap": "1rem",
      "panel-pad": "1.25rem",
      "list-columns": "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
      "list-gap": "var(--stack-gap)",
      "list-frame-border": "0px",
      "list-frame-radius": "0px",
      "list-item-border": "1px",
      "list-item-radius": "var(--radius)",
      "list-item-bg": "var(--card)",
      "list-item-pad": "var(--panel-pad)",
      "list-item-direction": "column",
      "list-item-align": "stretch",
      "list-item-trail": "0px",
    },
  },
};

export const DENSITY_KEYS = Object.keys(DENSITIES) as Density[];

/** Mode-independent tokens. `--radius` is the corners setting (2px shipped). */
export const STATIC_TOKENS: Record<string, string> = {
  radius: "2px",
  "motion-fast": "120ms",
  "motion-base": "200ms",
  "motion-slow": "320ms",
};
