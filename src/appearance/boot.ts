import { renderProductCss } from "../theme/css.js";
import { MIN_NON_TEXT_CONTRAST } from "../theme/contrast.js";
import { GROUNDS, SURFACES, type Mode } from "../theme/tokens.js";
import { CORNERS, type Product } from "./product.js";

/** What the boot script needs to know about a product: plain data, serialised into the page. */
export interface BootConfig {
  product: string;
  key: string;
  grounds: Record<string, { mode: Mode; background: string }>;
  accents: string[];
  corners: number[];
  minContrast: number;
  defaults: { dark: string; light: string; accent: string; density: string; corners: number };
}

export function bootConfig(product: Product): BootConfig {
  return {
    product: product.id,
    key: product.storageKey,
    grounds: Object.fromEntries(
      product.grounds.map((g) => [g, { mode: GROUNDS[g].mode, background: SURFACES[g].background }])
    ),
    accents: product.accents.map((a) => a.key),
    corners: [...CORNERS],
    minContrast: MIN_NON_TEXT_CONTRAST,
    defaults: {
      dark: product.defaults.ground.dark,
      light: product.defaults.ground.light,
      accent: product.defaults.accent,
      density: product.defaults.density,
      corners: product.defaults.corners,
    },
  };
}

/**
 * The boot script, as source text: plain ES5 in a string, so no bundler,
 * transpiler or coverage tool can rewrite it into something that needs a
 * helper from outside. It is `normalize` + `resolveAppearance` (with no org
 * policy, which cannot be known before paint) + `applyAppearance`, written a
 * second time; boot.test.ts runs it against those over a matrix of stored
 * preferences and system modes, so the two cannot drift apart.
 */
const BOOT_SOURCE = `function (c) {
  var d = document.documentElement, p = {};
  try {
    var raw = window.localStorage.getItem(c.key);
    var parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") p = parsed;
  } catch (e) {}
  var light = false;
  try {
    light = window.matchMedia("(prefers-color-scheme: light)").matches;
  } catch (e) {}
  var has = function (o, k) {
    return typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);
  };
  var lum = function (h) {
    var n = parseInt(h.slice(1), 16), rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    var w = [0.2126, 0.7152, 0.0722], s = 0;
    for (var i = 0; i < 3; i++) {
      var v = rgb[i] / 255;
      s += w[i] * (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    }
    return s;
  };
  var ratio = function (x, y) {
    var a = lum(x), b = lum(y);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  var ground = has(c.grounds, p.ground) ? p.ground : light ? c.defaults.light : c.defaults.dark;
  var accent = p.accent;
  var custom = typeof accent === "string" && /^#[0-9a-f]{6}$/.test(accent) &&
    ratio(accent, c.grounds[ground].background) >= c.minContrast;
  d.dataset.product = c.product;
  d.dataset.ground = ground;
  d.dataset.mode = c.grounds[ground].mode;
  if (custom) {
    d.dataset.accent = "custom";
    d.style.setProperty("--brand-primary", accent);
    d.style.setProperty("--brand-on-primary",
      ratio(accent, "#000000") >= ratio(accent, "#ffffff") ? "#000000" : "#ffffff");
  } else {
    d.dataset.accent = c.accents.indexOf(accent) > -1 ? accent : c.defaults.accent;
  }
  d.dataset.density = p.density === "compact" || p.density === "cards" ? p.density : c.defaults.density;
  d.style.setProperty("--radius",
    (c.corners.indexOf(p.corners) > -1 ? p.corners : c.defaults.corners) + "px");
}`;

/** JSON that is safe inside an inline <script>. */
function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * The inline script that stamps a product's appearance on <html> before
 * first paint. Render it in <head> (AppearanceScript does), or write it into
 * an HTML template yourself.
 */
export function appearanceScript(product: Product): string {
  return `try{(${BOOT_SOURCE})(${scriptJson(bootConfig(product))})}catch(e){}`;
}

/** The product's brand tokens as a CSS string: its sidebar surface and its own accent. */
export function productStyles(product: Product): string {
  return renderProductCss({ sidebar: product.sidebar, brandAccent: product.brandAccent });
}
