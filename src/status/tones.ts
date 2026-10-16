/**
 * The one status colour map (Astrolift #2126). Status is semantic and never
 * follows the accent: with a copper or ice accent a healthy deployment is
 * still lime, a failure still red. Every tone here is a status token.
 */
export type StatusTone = "ok" | "warn" | "error" | "info" | "muted";

export const STATUS_TONES: readonly StatusTone[] = ["ok", "warn", "error", "info", "muted"];

/** The status token each tone paints. `muted` has none: it is the muted foreground. */
export const TONE_TOKEN: Record<StatusTone, "success" | "warning" | "danger" | "info" | null> = {
  ok: "success",
  warn: "warning",
  error: "danger",
  info: "info",
  muted: null,
};

/** A dot: solid status colour with a soft halo, the one glow the brand permits besides focus. */
export const DOT_TONE: Record<StatusTone, string> = {
  ok: "bg-success shadow-success/50",
  warn: "bg-warning shadow-warning/50",
  error: "bg-danger shadow-danger/50",
  info: "bg-info shadow-info/50",
  muted: "bg-muted-foreground shadow-muted-foreground/40",
};

/** How much of the status colour tints a pill's fill (`bg-success/15`). */
export const PILL_TINT = 0.15;

/** A pill: tinted fill, readable text, tinted hairline. */
export const PILL_TONE: Record<StatusTone, string> = {
  ok: "border-success-border bg-success/15 text-success-fg",
  warn: "border-warning-border bg-warning/15 text-warning-fg",
  error: "border-danger-border bg-danger/15 text-danger-fg",
  info: "border-info-border bg-info/15 text-info-fg",
  muted: "border-border bg-foreground/5 text-muted-foreground",
};

/** In-flight states pulse; nothing else moves. Reduced motion holds it still. */
export const IN_FLIGHT = "animate-pulse motion-reduce:animate-none";
