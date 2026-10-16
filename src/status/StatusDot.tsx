import { cn } from "../lib/cn.js";
import { DOT_TONE, IN_FLIGHT, type StatusTone } from "./tones.js";

export interface StatusDotProps {
  tone: StatusTone;
  /** In flight (deploying, running): the dot pulses. */
  pulse?: boolean;
  /**
   * Read by screen readers when the dot stands alone (a tree row, a table
   * cell with no text). Leave it out when a visible label sits beside it.
   */
  label?: string;
  className?: string;
}

/** A status mark. Its colour is a status token, so it means the same thing whatever the accent. */
export function StatusDot({ tone, pulse = false, label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)} data-tone={tone}>
      <span
        aria-hidden
        className={cn(
          "inline-block size-2 rounded-full shadow-[0_0_0_2px_var(--background)]",
          DOT_TONE[tone],
          pulse && IN_FLIGHT
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
