import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../primitives/Button.js";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./Drawer.js";

/** Secondary content that should not cost a page. The Astrolift UI calls it a sheet. */
const meta = { title: "Overlays/Drawer", component: Drawer } satisfies Meta<typeof Drawer>;
export default meta;

type Story = StoryObj<typeof meta>;

function Example({ open, side }: { open?: boolean; side?: "right" | "left" | "bottom" }) {
  return (
    <Drawer defaultOpen={open}>
      <DrawerTrigger asChild>
        <Button variant="outline">Run details</Button>
      </DrawerTrigger>
      <DrawerContent side={side}>
        <DrawerHeader>
          <DrawerTitle>Run 7f3c2a91</DrawerTitle>
          <DrawerDescription>support-bot, triggered by a webhook 2 minutes ago.</DrawerDescription>
        </DrawerHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-4 text-sm">
          <dt className="text-muted-foreground">Took</dt>
          <dd className="font-mono">0:42</dd>
          <dt className="text-muted-foreground">Exit code</dt>
          <dd className="font-mono">0</dd>
        </dl>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export const Closed: Story = { render: () => <Example /> };
export const Right: Story = { render: () => <Example open side="right" /> };
export const Left: Story = { render: () => <Example open side="left" /> };
export const Bottom: Story = { render: () => <Example open side="bottom" /> };
