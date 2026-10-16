import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../primitives/Button.js";
import { Section } from "./Section.js";

/** A page region is a heading, not a border. */
const meta = {
  title: "Page/Section",
  component: Section,
  args: {
    title: "Environments",
    description: "Where this app runs, and what each one is pinned to.",
    action: (
      <Button size="sm" variant="outline">
        Add environment
      </Button>
    ),
    children: (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        A Card, a table or a chart goes here: two container levels at most.
      </div>
    ),
  },
} satisfies Meta<typeof Section>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Divided: Story = { args: { divided: true } };
export const Untitled: Story = {
  args: { title: undefined, description: undefined, action: undefined },
};
export const SubSection: Story = { args: { headingLevel: "h3", title: "Secrets" } };
