import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import type { NavModel } from "../nav/model.js";
import { AppShell } from "./AppShell.js";
import { RailPanel } from "./RailPanel.js";
import { Sidebar } from "./Sidebar.js";

const NAV: NavModel = [
  {
    key: "apps",
    label: "Apps",
    icon: HomeIcon,
    groups: [
      {
        functions: [
          { key: "apps", label: "Apps", href: "/apps" },
          { key: "jobs", label: "Scheduled jobs", href: "/jobs" },
        ],
      },
    ],
  },
];

function renderShell(
  props: { onToggleSidebar?: () => void; onToggleRightRail?: () => void; expanded?: boolean } = {}
) {
  return render(
    <AppShell
      sidebar={<Sidebar nav={NAV} active={null} collapsed={false} onCollapsedChange={() => {}} />}
      rightRail={
        <RailPanel label="Projects" collapsed={false} onCollapsedChange={() => {}}>
          <a href="/apps/checkout">checkout</a>
        </RailPanel>
      }
      rightRailLabel="Projects"
      rightRailExpanded={props.expanded}
      header={<span>search</span>}
      onToggleSidebar={props.onToggleSidebar}
      onToggleRightRail={props.onToggleRightRail}
    >
      <input aria-label="Filter" />
      <p>content</p>
    </AppShell>
  );
}

describe("AppShell", () => {
  it("lays out the sidebar, the content as the main landmark, and the right rail", () => {
    renderShell();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("content");
    expect(screen.getByRole("complementary", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("search")).toBeInTheDocument();
  });

  it("offers a skip link to the content", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("toggles the rails with [ and ]", async () => {
    const onToggleSidebar = vi.fn();
    const onToggleRightRail = vi.fn();
    renderShell({ onToggleSidebar, onToggleRightRail });
    fireEvent.keyDown(document.body, { key: "[" });
    fireEvent.keyDown(document.body, { key: "]" });
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    expect(onToggleRightRail).toHaveBeenCalledTimes(1);
  });

  it("leaves [ and ] alone while typing, with a modifier, or in a dialog", async () => {
    const onToggleSidebar = vi.fn();
    renderShell({ onToggleSidebar });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Filter" }), { key: "[" });
    fireEvent.keyDown(window, { key: "[", metaKey: true });
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const inside = document.createElement("button");
    dialog.appendChild(inside);
    document.body.appendChild(dialog);
    fireEvent.keyDown(inside, { key: "[" });
    dialog.remove();
    expect(onToggleSidebar).not.toHaveBeenCalled();
  });

  it("opens the sidebar in a drawer on narrow screens, and closes it when a link is followed", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: "Navigation" }));
    const drawer = await screen.findByRole("dialog", { name: "Navigation" });
    // In the drawer the sidebar has no collapse control: there is nothing beside it to make room for.
    expect(
      within(drawer).queryByRole("button", { name: "Collapse sidebar" })
    ).not.toBeInTheDocument();
    fireEvent.click(within(drawer).getByRole("link", { name: "Scheduled jobs" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the right rail in its own drawer, named by its label", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: "Projects" }));
    const drawer = await screen.findByRole("dialog", { name: "Projects" });
    expect(within(drawer).queryByRole("button", { name: "Hide projects" })).not.toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "checkout" })).toBeInTheDocument();
  });

  it("gives the content column to an expanded right rail on wide screens", () => {
    renderShell({ expanded: true });
    expect(screen.getByRole("main").parentElement).toHaveClass("md:hidden");
  });
});
