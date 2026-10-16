import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontalIcon } from "lucide-react";

import { ASTROLIFT_NAV } from "../examples/products.js";
import { areaSwitcher } from "../nav/model.js";
import { Button } from "../primitives/Button.js";
import { StatusBadge } from "../status/StatusBadge.js";
import { PageHeader } from "./PageHeader.js";

const tabs = [
  "Overview",
  "Deployments",
  "Workloads",
  "Logs & metrics",
  "Domains",
  "Secrets",
  "Settings",
].map((label, i) => ({ key: label, label, href: "#", active: i === 0 }));

/** Three rows: the breadcrumb, the title row, at most one row of tabs. */
const meta = {
  title: "Page/PageHeader",
  component: PageHeader,
  args: {
    crumbs: [areaSwitcher(ASTROLIFT_NAV, "apps", "apps"), { label: "checkout" }],
    title: "checkout",
    status: <StatusBadge tone="ok">running</StatusBadge>,
    context: "production · us-west-2",
    primaryAction: <Button size="sm">Deploy</Button>,
    menu: (
      <Button size="icon-sm" variant="ghost" aria-label="More actions">
        <MoreHorizontalIcon aria-hidden />
      </Button>
    ),
    tabs,
    tabsLabel: "App",
  },
} satisfies Meta<typeof PageHeader>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Detail: Story = {};

export const List: Story = {
  args: {
    crumbs: [areaSwitcher(ASTROLIFT_NAV, "apps", "deployments")],
    title: "Deployments",
    status: undefined,
    context: undefined,
    menu: undefined,
    primaryAction: <Button size="sm">New deployment</Button>,
    tabs: ["All", "Mine", "Failing", "Waiting for approval"].map((label, i) => ({
      key: label,
      label,
      href: "#",
      active: i === 0,
    })),
    tabsLabel: "Views",
  },
};

export const WithDescription: Story = {
  args: {
    tabs: undefined,
    description:
      "The storefront's checkout service. Owned by the payments team; pages them on failure.",
  },
};

export const LongTitle: Story = {
  args: { title: "checkout-service-for-the-european-storefront-with-a-name-nobody-shortened" },
  decorators: [
    (Story) => (
      <div className="w-192">
        <Story />
      </div>
    ),
  ],
};
