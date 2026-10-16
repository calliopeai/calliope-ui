import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { RailPlacementContext } from "./placement.js";
import { type RailPanelProps, RailPanel } from "./RailPanel.js";

function Panel(props: Partial<RailPanelProps>) {
  return (
    <RailPanel label="Assistant" collapsed={false} onCollapsedChange={() => {}} {...props}>
      <p>conversation</p>
    </RailPanel>
  );
}

describe("RailPanel", () => {
  it("is a labelled complementary region at its width, with a hide control", async () => {
    const onCollapsedChange = vi.fn();
    render(<Panel width={300} onCollapsedChange={onCollapsedChange} />);
    const rail = screen.getByRole("complementary", { name: "Assistant" });
    expect(rail).toHaveStyle({ width: "300px" });
    await userEvent.click(screen.getByRole("button", { name: "Hide assistant" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("collapses to a strip with a show control", async () => {
    const onCollapsedChange = vi.fn();
    render(<Panel collapsed onCollapsedChange={onCollapsedChange} />);
    expect(screen.queryByText("conversation")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show assistant" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("collapses to nothing when asked", () => {
    const { container } = render(<Panel collapsed collapsedMode="hidden" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("resizes from the keyboard, held to its range", async () => {
    function Resizable() {
      const [width, setWidth] = React.useState(400);
      return <Panel width={width} minWidth={320} maxWidth={560} onWidthChange={setWidth} />;
    }
    render(<Resizable />);
    const handle = screen.getByRole("separator", { name: "Resize assistant" });
    expect(handle).toHaveAttribute("aria-valuenow", "400");
    expect(handle).toHaveAttribute("aria-valuemin", "320");
    expect(handle).toHaveAttribute("aria-valuemax", "560");
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "432");
    await userEvent.keyboard("{ArrowRight}");
    expect(handle).toHaveAttribute("aria-valuenow", "416");
    await userEvent.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "320");
    await userEvent.keyboard("{ArrowRight}");
    expect(handle).toHaveAttribute("aria-valuenow", "320");
    await userEvent.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "560");
  });

  it("resizes by dragging its inner edge: left widens a right rail", () => {
    const onWidthChange = vi.fn();
    render(<Panel width={400} minWidth={320} maxWidth={560} onWidthChange={onWidthChange} />);
    const handle = screen.getByRole("separator");
    fireEvent.pointerDown(handle, { button: 0, clientX: 1000, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 950, pointerId: 1 });
    expect(onWidthChange).toHaveBeenLastCalledWith(450);
    fireEvent.pointerMove(handle, { clientX: 500, pointerId: 1 });
    expect(onWidthChange).toHaveBeenLastCalledWith(560);
    fireEvent.pointerUp(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 1200, pointerId: 1 });
    expect(onWidthChange).toHaveBeenCalledTimes(2);
  });

  it("has no resize handle unless it can report a width", () => {
    render(<Panel width={400} />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("expands to full width and back", async () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <Panel onExpandedChange={onExpandedChange} onWidthChange={() => {}} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Expand assistant to full width" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    rerender(<Panel expanded onExpandedChange={onExpandedChange} onWidthChange={() => {}} />);
    expect(screen.getByRole("complementary").style.width).toBe("");
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Restore assistant to the side" }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it("in a drawer, fills it and shows no rail controls, even when collapsed", () => {
    render(
      <RailPlacementContext.Provider value="drawer">
        <Panel
          collapsed
          collapsedMode="hidden"
          onWidthChange={() => {}}
          onExpandedChange={() => {}}
        />
      </RailPlacementContext.Provider>
    );
    expect(screen.getByText("conversation")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });
});
