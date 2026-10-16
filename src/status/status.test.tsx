import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./StatusBadge.js";
import { StatusDot } from "./StatusDot.js";
import { DOT_TONE, PILL_TONE, STATUS_TONES, TONE_TOKEN } from "./tones.js";

/**
 * Status is semantic: a tone paints its status token and nothing that an
 * accent or a ground can move (Astrolift #2126, where "ok" was painted with
 * the selectable accent and turned copper with the copper accent).
 */
describe("status tones", () => {
  it.each(STATUS_TONES)("%s paints its own status token and never the accent", (tone) => {
    const classes = `${DOT_TONE[tone]} ${PILL_TONE[tone]}`;
    expect(classes).not.toMatch(/primary|accent|brand|chart/);
    const token = TONE_TOKEN[tone];
    if (token) {
      expect(DOT_TONE[tone]).toContain(`bg-${token}`);
      expect(PILL_TONE[tone]).toContain(`text-${token}-fg`);
      expect(PILL_TONE[tone]).toContain(`border-${token}-border`);
    } else {
      expect(PILL_TONE[tone]).toContain("text-muted-foreground");
    }
  });
});

describe("StatusBadge", () => {
  it("says the status in words, with its tone in a data attribute", () => {
    render(<StatusBadge tone="error">failed</StatusBadge>);
    const badge = screen.getByText("failed").closest("[data-slot=status-badge]");
    expect(badge).toHaveAttribute("data-tone", "error");
    expect(badge).toHaveClass("text-danger-fg");
  });

  it("pulses its dot in flight while the label holds still, and strikes a superseded label", () => {
    render(
      <>
        <StatusBadge tone="info" pulse>
          deploying
        </StatusBadge>
        <StatusBadge tone="muted" struck>
          superseded
        </StatusBadge>
      </>
    );
    const badge = screen.getByText("deploying").closest("[data-slot=status-badge]")!;
    expect(badge).not.toHaveClass("animate-pulse");
    expect(badge.querySelector("[aria-hidden]")).toHaveClass(
      "animate-pulse",
      "motion-reduce:animate-none"
    );
    expect(screen.getByText("superseded")).toHaveClass("line-through");
  });
});

describe("StatusDot", () => {
  it("is decorative beside a label, and speaks for itself when given one", () => {
    const { container, rerender } = render(<StatusDot tone="ok" />);
    expect(container.textContent).toBe("");
    rerender(<StatusDot tone="error" label="failing" />);
    expect(screen.getByText("failing")).toHaveClass("sr-only");
  });
});
