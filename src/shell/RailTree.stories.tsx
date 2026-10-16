import type { Meta, StoryObj } from "@storybook/react-vite";
import { PackageIcon } from "lucide-react";

import { PROJECTS } from "./rail.fixtures.js";
import { RailTree } from "./RailTree.js";

/** Astrolift's projects, generalized: linked groups for a rail. The group holding the current page opens. */
const meta = {
  title: "Shell/RailTree",
  component: RailTree,
  args: {
    label: "My projects",
    groups: PROJECTS,
    activeHref: "/apps/checkout",
    emptyText: "You are not in a project yet.",
  },
  decorators: [
    (Story) => (
      <div className="w-65 rounded-lg bg-sidebar text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RailTree>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { groups: [] } };
export const LongNames: Story = {
  args: {
    groups: [
      {
        key: "long",
        label: "a-project-whose-name-runs-well-past-the-rail",
        items: [
          {
            key: "x",
            label: "an-app-with-an-even-longer-name-than-its-project",
            href: "/apps/x",
            icon: PackageIcon,
            status: "ok",
            statusLabel: "healthy",
          },
        ],
      },
    ],
    activeHref: "/apps/x",
  },
};
