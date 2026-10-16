import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover.js";

const meta = { title: "Primitives/Popover", component: Popover } satisfies Meta<typeof Popover>;
export default meta;

type Story = StoryObj<typeof meta>;

function Example({ open }: { open?: boolean }) {
  return (
    <Popover defaultOpen={open}>
      <PopoverTrigger asChild>
        <Button variant="outline">Region</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-medium">us-west-2</p>
        <p className="text-muted-foreground">Three clusters, one in maintenance until 14:00 UTC.</p>
      </PopoverContent>
    </Popover>
  );
}

export const Closed: Story = { render: () => <Example /> };
export const Open: Story = { render: () => <Example open />, parameters: { layout: "centered" } };
