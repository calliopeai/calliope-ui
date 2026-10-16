import type { Meta, StoryObj } from "@storybook/react-vite";

import { ASTROLIFT_NAV } from "../examples/products.js";
import { areaSwitcher } from "../nav/model.js";
import { Breadcrumbs } from "./Breadcrumbs.js";

/** Crumbs come from the navigation model; the first one switches between the area's functions. */
const meta = { title: "Page/Breadcrumbs", component: Breadcrumbs } satisfies Meta<
  typeof Breadcrumbs
>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithSwitcher: Story = {
  args: {
    crumbs: [areaSwitcher(ASTROLIFT_NAV, "apps", "deployments"), { label: "Deployment 101" }],
  },
};

export const Linked: Story = {
  args: {
    crumbs: [
      { label: "Policies", href: "/policies" },
      { label: "Budgets", href: "/policies?type=budget" },
      { label: "Monthly cap" },
    ],
  },
};

export const LongTrail: Story = {
  args: {
    crumbs: [
      areaSwitcher(ASTROLIFT_NAV, "agents", "agents"),
      { label: "a-very-long-agent-name-that-goes-on", href: "/agents/x" },
      { label: "Run 7f3c2a91-0c3e-4b9e-9e8c-2a0f1d4b6c55" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};
