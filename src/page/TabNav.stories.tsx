import type { Meta, StoryObj } from "@storybook/react-vite";

import { TabNav } from "./TabNav.js";

const TABS = ["Activity", "Interactions", "Usage", "Compliance", "Controls", "Policies"].map(
  (label, i) => ({
    key: label.toLowerCase(),
    label,
    href: `/agents/a-7f3c/${label.toLowerCase()}`,
    active: i === 0,
  })
);

/** Tabs that are pages: links, one row per page, named by function. */
const meta = {
  title: "Page/TabNav",
  component: TabNav,
  args: { tabs: TABS, label: "Agent" },
} satisfies Meta<typeof TabNav>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** On a narrow screen the row scrolls sideways under an edge fade. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const SingleTab: Story = { args: { tabs: [TABS[0]!] } };
