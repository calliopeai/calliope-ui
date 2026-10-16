import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PROJECTS } from "./rail.fixtures.js";
import { RailTree } from "./RailTree.js";

describe("RailTree", () => {
  it("opens the group holding the current page and lights that row", () => {
    render(
      <RailTree label="My projects" groups={PROJECTS} activeHref="/apps/ingest" emptyText="none" />
    );
    expect(screen.getByRole("button", { name: /data-platform/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: /storefront/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("link", { name: /ingest/ })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: /checkout/ })).not.toBeInTheDocument();
  });

  it("names each group's count and each row's status in words", () => {
    render(
      <RailTree
        label="My projects"
        groups={PROJECTS}
        activeHref="/apps/checkout"
        emptyText="none"
      />
    );
    expect(screen.getByRole("button", { name: "storefront 4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "billing-api failing" })).toBeInTheDocument();
  });

  it("folds and unfolds a group", async () => {
    render(<RailTree label="My projects" groups={PROJECTS} emptyText="none" />);
    await userEvent.click(screen.getByRole("button", { name: /internal-tools/ }));
    expect(screen.getByRole("link", { name: /status-board/ })).toBeInTheDocument();
  });

  it("says so when there is nothing, and shows placeholders while loading", () => {
    const { rerender } = render(
      <RailTree label="My projects" groups={[]} emptyText="You are not in a project yet." />
    );
    expect(screen.getByText("You are not in a project yet.")).toBeInTheDocument();
    rerender(<RailTree label="My projects" groups={PROJECTS} loading emptyText="none" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
