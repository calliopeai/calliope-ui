import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import type { NavModel } from "../nav/model.js";
import { RailPlacementContext } from "./placement.js";
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
          { key: "jobs", label: "Jobs", href: "/jobs" },
        ],
      },
    ],
  },
];

function renderSidebar(collapsed: boolean, onCollapsedChange = vi.fn()) {
  render(
    <Sidebar
      nav={NAV}
      active={{ area: "apps", fn: "jobs" }}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      header={<span>Astrolift AI</span>}
      headerCollapsed={<span>mark</span>}
      footer={<span>Leo Mata</span>}
    />
  );
  return onCollapsedChange;
}

describe("Sidebar", () => {
  it("expanded: brand, labelled navigation, footer, and a collapse control", async () => {
    const onCollapsedChange = renderSidebar(false);
    expect(screen.getByText("Astrolift AI")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jobs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Leo Mata")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("collapsed: the mark only, no footer, and an expand control", async () => {
    const onCollapsedChange = renderSidebar(true);
    expect(screen.getByText("mark")).toBeInTheDocument();
    expect(screen.queryByText("Astrolift AI")).not.toBeInTheDocument();
    expect(screen.queryByText("Leo Mata")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("in a drawer, ignores its collapsed state and drops the collapse control", () => {
    render(
      <RailPlacementContext.Provider value="drawer">
        <Sidebar
          nav={NAV}
          active={null}
          collapsed
          onCollapsedChange={() => {}}
          header={<span>Astrolift AI</span>}
        />
      </RailPlacementContext.Provider>
    );
    expect(screen.getByText("Astrolift AI")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apps" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sidebar/ })).not.toBeInTheDocument();
  });
});
