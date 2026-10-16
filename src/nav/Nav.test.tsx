import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BotIcon, HomeIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { type LinkProps, UIProvider } from "../provider/UIProvider.js";
import type { NavModel } from "./model.js";
import { Nav } from "./Nav.js";

const NAV: NavModel = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
    flat: true,
    groups: [{ functions: [{ key: "home", label: "Home", href: "/dashboard", icon: HomeIcon }] }],
  },
  {
    key: "agents",
    label: "Agents",
    icon: BotIcon,
    groups: [
      {
        functions: [
          {
            key: "agents",
            label: "Agents",
            href: "/agents",
            attributes: { "data-tour": "agents-nav" },
          },
          { key: "runs", label: "Runs", href: "/tasks" },
        ],
      },
      {
        key: "build",
        label: "Build",
        functions: [{ key: "skills", label: "Skills", href: "/agents/skills" }],
      },
    ],
  },
  {
    key: "models",
    label: "Models",
    icon: BotIcon,
    groups: [{ functions: [{ key: "models", label: "Models", href: "/models" }] }],
  },
];

describe("Nav, expanded", () => {
  it("lights the current row and only it", () => {
    render(<Nav nav={NAV} active={{ area: "agents", fn: "runs" }} />);
    expect(screen.getByRole("link", { name: "Runs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Agents" })).not.toHaveAttribute("aria-current");
  });

  it("draws a flat area as rows with no heading, and other areas as folding headings", async () => {
    render(<Nav nav={NAV} active={null} />);
    expect(screen.queryByRole("button", { name: "Home" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    const heading = screen.getByRole("button", { name: "Agents" });
    expect(heading).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Build")).toBeInTheDocument();
    await userEvent.click(heading);
    expect(heading).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Runs" })).not.toBeInTheDocument();
  });

  it("passes a row's attributes to its link, and draws links with the app's component", () => {
    function AppLink({ ref, href, children, ...props }: LinkProps) {
      return (
        <a ref={ref} href={href} data-app-link="" {...props}>
          {children}
        </a>
      );
    }
    render(
      <UIProvider link={AppLink}>
        <Nav nav={NAV} active={null} />
      </UIProvider>
    );
    const agents = screen.getByRole("link", { name: "Agents" });
    expect(agents).toHaveAttribute("data-tour", "agents-nav");
    expect(agents).toHaveAttribute("data-app-link");
    expect(agents).toHaveAttribute("href", "/agents");
  });

  it("calls onNavigate when a row is followed", async () => {
    const onNavigate = vi.fn();
    render(<Nav nav={NAV} active={null} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("link", { name: "Skills" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe("Nav, collapsed", () => {
  it("makes a one-row area a single icon link, named for the screen reader", () => {
    render(<Nav nav={NAV} active={{ area: "models", fn: "models" }} collapsed />);
    const models = screen.getByRole("link", { name: "Models" });
    expect(models).toHaveAttribute("href", "/models");
    expect(models).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/dashboard");
  });

  it("opens an area's rows in a flyout from the keyboard, with focus moved in", async () => {
    render(<Nav nav={NAV} active={{ area: "agents", fn: "agents" }} collapsed />);
    const trigger = screen.getByRole("button", { name: "Agents" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const flyout = await screen.findByRole("dialog");
    expect(within(flyout).getByRole("link", { name: "Agents" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(flyout).getByRole("link", { name: "Skills" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on hover without stealing focus, and closes once the pointer leaves", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(<Nav nav={NAV} active={null} collapsed />);
      const trigger = screen.getByRole("button", { name: "Agents" });
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      const flyout = await screen.findByRole("dialog");
      expect(flyout).not.toContainElement(document.activeElement as HTMLElement);
      fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
      // Still open inside the grace period, so the pointer can cross to the flyout.
      await act(() => vi.advanceTimersByTimeAsync(100));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(100));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
