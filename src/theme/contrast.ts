/** Relative luminance of a `#rrggbb` colour (WCAG 2.2). */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio between two `#rrggbb` colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG 2.2 §1.4.11: a control or a status mark stands 3:1 off what it sits on. */
export const MIN_NON_TEXT_CONTRAST = 3;

/** WCAG 2.2 §1.4.3: body text stands 4.5:1 off its background. */
export const MIN_TEXT_CONTRAST = 4.5;
