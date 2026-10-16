import type * as React from "react";

import { cn } from "../lib/cn.js";
import { IN_FLIGHT, PILL_TONE, type StatusTone } from "./tones.js";

export interface StatusBadgeProps extends Omit<React.ComponentProps<"span">, "children"> {
  tone: StatusTone;
  /** The status in words ("running", "failed"). Colour is never the only carrier. */
  children: React.ReactNode;
  /** In flight (deploying, running): the dot pulses; the label holds still, so it stays readable. */
  pulse?: boolean;
  /** Strike the label through, for superseded states. */
  struck?: boolean;
}

/**
 * A status pill: mono label, tinted fill, glowing dot (the admin badge
 * recipe). Apps map their own states onto the five tones, once, in a table:
 *
 *   const DEPLOYMENT_TONE = { running: "ok", failed: "error", deploying: "info", ... };
 *   <StatusBadge tone={DEPLOYMENT_TONE[d.status]} pulse={d.status === "deploying"}>{label}</StatusBadge>
 */
export function StatusBadge({
  tone,
  children,
  pulse = false,
  struck = false,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      data-tone={tone}
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1.5 overflow-hidden rounded-full border px-2 font-mono text-xs font-semibold whitespace-nowrap",
        PILL_TONE[tone],
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full bg-current shadow-[0_0_8px_currentColor]",
          pulse && IN_FLIGHT
        )}
      />
      <span className={cn("truncate", struck && "line-through")}>{children}</span>
    </span>
  );
}
