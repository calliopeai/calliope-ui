import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon, RocketIcon, Trash2Icon } from "lucide-react";

import { Button } from "./Button.js";

/** Buttons take the corners setting at every size. Try the Corners toolbar. */
const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Deploy" },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Deploy</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="secondary">Duplicate</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="destructive">
        <Trash2Icon aria-hidden /> Delete
      </Button>
      <Button variant="link">View logs</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="New app">
        <PlusIcon aria-hidden />
      </Button>
      <Button size="icon-sm" variant="outline" aria-label="Deploy">
        <RocketIcon aria-hidden />
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  render: () => (
    <Button asChild variant="outline">
      <a href="#docs">Read the docs</a>
    </Button>
  ),
};
