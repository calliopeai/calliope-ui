import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ASTROLIFT_NAV, ZENTINELLE_NAV, ZENTINELLE_ROLES } from "../examples/products.js";
import { activeFor, visibleNav } from "./model.js";
import { Nav } from "./Nav.js";

/** The areas and their functions, on the sidebar's surface. */
const meta = {
  title: "Navigation/Nav",
  component: Nav,
  decorators: [
    (Story) => (
      <div className="w-55 rounded-lg bg-sidebar p-2 text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Nav>;
export default meta;

type Story = StoryObj<typeof meta>;

const everything = visibleNav(ASTROLIFT_NAV, () => true);

export const Expanded: Story = {
  args: { nav: everything, active: activeFor(everything, "/deployments/101") },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Deployments" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await expect(canvas.getByRole("link", { name: "Apps" })).not.toHaveAttribute("aria-current");
  },
};

/** Only what the viewer may open: an install entitled to apps alone. */
export const AppsOnly: Story = {
  args: {
    nav: visibleNav(ASTROLIFT_NAV, (capability) => capability === "apps"),
    active: { area: "apps", fn: "apps" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("link", { name: "Agents" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Admin" })).not.toBeInTheDocument();
  },
};

/** Zentinelle's seven areas for a viewer: no Settings, no Evidence, no Providers. */
export const ZentinelleViewer: Story = {
  args: {
    nav: visibleNav(ZENTINELLE_NAV, (c) =>
      (ZENTINELLE_ROLES.viewer as readonly string[]).includes(c)
    ),
    active: { area: "policies", fn: "policies" },
  },
};

export const Collapsed: Story = {
  args: { nav: everything, active: { area: "agents", fn: "runs" }, collapsed: true },
  decorators: [
    (Story) => (
      <div className="w-12">
        <Story />
      </div>
    ),
  ],
};

export const LongLabels: Story = {
  args: {
    nav: [
      {
        key: "governance",
        label: "Usage, governance and the long tail of platform settings",
        icon: everything[0]!.icon,
        groups: [
          {
            label: "A group label that does not fit on one line",
            functions: [
              { key: "x", label: "Platform settings for every organization", href: "/x" },
            ],
          },
        ],
      },
    ],
    active: null,
  },
};
