import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { List, ListItem } from "./List.js";

const ITEMS = [
  { id: "github", name: "GitHub", blurb: "Builds on push." },
  { id: "slack", name: "Slack", blurb: "Alerts in a channel." },
];

function renderList(
  props: Partial<React.ComponentProps<typeof List<(typeof ITEMS)[number]>>> = {}
) {
  return render(
    <List
      label="Integrations"
      items={ITEMS}
      getKey={(i) => i.id}
      empty={{ title: "No integrations" }}
      renderItem={(i) => (
        <ListItem
          title={i.name}
          href={`/integrations/${i.id}`}
          description={i.blurb}
          meta="2d ago"
          actions={<button type="button">Configure {i.name}</button>}
        />
      )}
      {...props}
    />
  );
}

describe("List", () => {
  it("is a labelled list whose items link through their titles", () => {
    renderList();
    const items = within(screen.getByRole("list", { name: "Integrations" })).getAllByRole(
      "listitem"
    );
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "/integrations/github"
    );
    expect(within(items[0]!).getByText("2d ago")).toBeInTheDocument();
  });

  it("keeps an item's controls usable above its link", async () => {
    const onClick = vi.fn();
    render(
      <List
        label="Integrations"
        items={ITEMS}
        getKey={(i) => i.id}
        empty={{ title: "none" }}
        renderItem={(i) => (
          <ListItem
            title={i.name}
            href="#"
            actions={
              <button type="button" onClick={onClick}>
                Connect {i.name}
              </button>
            }
          />
        )}
      />
    );
    const button = screen.getByRole("button", { name: "Connect Slack" });
    expect(button.parentElement).toHaveClass("relative", "z-10");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("carries a density of its own when asked, so its subtree overrides the page's", () => {
    renderList({ density: "cards" });
    expect(screen.getByRole("list")).toHaveAttribute("data-density", "cards");
  });

  it("follows the page's density otherwise", () => {
    renderList();
    expect(screen.getByRole("list")).not.toHaveAttribute("data-density");
  });

  it("shows placeholders while loading, the empty state with nothing, and an alert on error", async () => {
    const onRetry = vi.fn();
    const { rerender } = renderList({ loading: true });
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    rerender(
      <List
        label="Integrations"
        items={[]}
        getKey={() => ""}
        renderItem={() => null}
        empty={{ title: "No integrations" }}
      />
    );
    expect(screen.getByText("No integrations")).toBeInTheDocument();
    rerender(
      <List
        label="Integrations"
        items={[]}
        getKey={() => ""}
        renderItem={() => null}
        empty={{ title: "No integrations" }}
        error={{ message: "service down" }}
        onRetry={onRetry}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load integrations");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });
});
