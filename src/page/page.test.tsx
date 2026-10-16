import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumbs } from "./Breadcrumbs.js";
import { PageFrame } from "./PageFrame.js";
import { PageHeader } from "./PageHeader.js";
import { Section } from "./Section.js";
import { TabNav } from "./TabNav.js";

const tabs = [
  { key: "overview", label: "Overview", href: "/apps/checkout", active: true },
  { key: "logs", label: "Logs", href: "/apps/checkout/logs", active: false },
];

describe("Breadcrumbs", () => {
  it("links the middle crumbs and marks the last as the page", () => {
    render(
      <Breadcrumbs
        crumbs={[
          { label: "Policies", href: "/policies" },
          { label: "Budgets", href: "/policies?type=budget" },
          { label: "Monthly cap" },
        ]}
      />
    );
    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(trail).getByRole("link", { name: "Policies" })).toHaveAttribute(
      "href",
      "/policies"
    );
    expect(within(trail).getByText("Monthly cap")).toHaveAttribute("aria-current", "page");
    expect(within(trail).queryByRole("link", { name: "Monthly cap" })).not.toBeInTheDocument();
    expect(within(trail).getAllByRole("listitem")).toHaveLength(3);
  });

  it("turns a crumb with a switcher into a menu of its siblings, the current one checked", async () => {
    render(
      <Breadcrumbs
        crumbs={[
          {
            label: "Apps",
            switcher: [
              { label: "Apps", href: "/apps", active: true },
              { label: "Deployments", href: "/deployments" },
            ],
          },
          { label: "checkout" },
        ]}
      />
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Switch from Apps" }), { key: "Enter" });
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Apps" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(menu).getByRole("menuitem", { name: "Deployments" })).toHaveAttribute(
      "href",
      "/deployments"
    );
  });
});

describe("TabNav", () => {
  it("is a labelled row of links with the current page marked", () => {
    render(<TabNav tabs={tabs} label="App" />);
    const nav = screen.getByRole("navigation", { name: "App" });
    expect(within(nav).getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(nav).getByRole("link", { name: "Logs" })).not.toHaveAttribute("aria-current");
  });
});

describe("PageHeader", () => {
  it("is one h1 with its status, context, actions and one row of tabs", () => {
    render(
      <PageHeader
        crumbs={[{ label: "Apps", href: "/apps" }, { label: "checkout" }]}
        title="checkout"
        status={<span>running</span>}
        context="production · us-west-2"
        primaryAction={<button type="button">Deploy</button>}
        menu={<button type="button">More</button>}
        tabs={tabs}
        tabsLabel="App"
      />
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "checkout" })).toBeInTheDocument();
    expect(screen.getByText("production · us-west-2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deploy" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation")).toHaveLength(2);
  });

  it("draws no breadcrumb or tab row when there is none", () => {
    render(<PageHeader title="Overview" />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("PageFrame", () => {
  it("puts the header, then the notice and the filters, then the body", () => {
    render(
      <PageFrame
        title="Runs"
        notice={<p>notice</p>}
        filters={<button type="button">Status</button>}
      >
        <p>body</p>
      </PageFrame>
    );
    const order = ["Runs", "notice", "Status", "body"].map((text) => screen.getByText(text));
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1]!.compareDocumentPosition(order[i]!) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }
  });
});

describe("Section", () => {
  it("is a region named by its heading, at the level asked for", () => {
    render(
      <Section title="Secrets" headingLevel="h3" aria-labelledby="secrets-heading">
        <p>content</p>
      </Section>
    );
    expect(screen.getByRole("heading", { level: 3, name: "Secrets" })).toBeInTheDocument();
  });

  it("draws no heading row without a title, description or action", () => {
    const { container } = render(
      <Section>
        <p>content</p>
      </Section>
    );
    expect(container.querySelector("section")?.children).toHaveLength(1);
  });
});
