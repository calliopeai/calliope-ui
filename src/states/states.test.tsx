import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState.js";
import { ErrorState } from "./ErrorState.js";
import { LoadingState } from "./LoadingState.js";

describe("EmptyState", () => {
  it("offers the create action as a link, and in-app help through the app's link", () => {
    render(
      <EmptyState
        title="No clusters yet"
        actionHref="/clusters/new"
        actionLabel="Register a cluster"
        learnMoreHref="/docs/clusters"
      />
    );
    expect(screen.getByRole("link", { name: "Register a cluster" })).toHaveAttribute(
      "href",
      "/clusters/new"
    );
    const help = screen.getByRole("link", { name: "Learn more" });
    expect(help).toHaveAttribute("href", "/docs/clusters");
    expect(help).not.toHaveAttribute("target");
  });

  it("opens external help in a new tab", () => {
    render(
      <EmptyState
        title="No clusters yet"
        learnMoreHref="https://docs.astrolift.ai"
        learnMoreLabel="Read the guide"
      />
    );
    const help = screen.getByRole("link", { name: "Read the guide" });
    expect(help).toHaveAttribute("target", "_blank");
    expect(help).toHaveAttribute("rel", "noreferrer");
  });

  it("draws no action without both its link and its label", () => {
    render(<EmptyState title="No clusters yet" actionHref="/clusters/new" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("inline: an alert with what failed, the message and retry", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState title="Could not load runs" error={{ message: "timed out" }} onRetry={onRetry} />
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not load runs");
    expect(alert).toHaveTextContent("timed out");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("falls back to a generic title and line", () => {
    render(<ErrorState error={null} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("alert")).toHaveTextContent("An unexpected error occurred.");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("page: a heading, the digest to trace, and a way out", () => {
    render(
      <ErrorState
        variant="page"
        error="boom"
        digest="3f9a1c2e"
        homeHref="/dashboard"
        homeLabel="Go to the dashboard"
        onRetry={() => {}}
      />
    );
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByText("Error ID 3f9a1c2e")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the dashboard" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});

describe("LoadingState", () => {
  it("announces itself once, and draws the number of rows asked for", () => {
    const { container } = render(<LoadingState label="Loading integrations" rows={3} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading integrations");
    expect(container.querySelectorAll("[data-slot=loading-state] > div")).toHaveLength(3);
  });

  it("stands in for a whole page", () => {
    render(<LoadingState variant="page" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
});
