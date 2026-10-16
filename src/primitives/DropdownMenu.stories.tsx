import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, MoreHorizontalIcon, PauseIcon, Trash2Icon } from "lucide-react";

import { Button } from "./Button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu.js";

const meta = { title: "Primitives/DropdownMenu", component: DropdownMenu } satisfies Meta<
  typeof DropdownMenu
>;
export default meta;

type Story = StoryObj<typeof meta>;

function Menu({ open }: { open?: boolean }) {
  return (
    <DropdownMenu defaultOpen={open} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Actions for checkout">
          <MoreHorizontalIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>checkout</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CopyIcon aria-hidden /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PauseIcon aria-hidden /> Pause deploys
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Promote (no staging build)</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon aria-hidden /> Delete app
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Closed: Story = { render: () => <Menu /> };
export const Open: Story = { render: () => <Menu open />, parameters: { layout: "centered" } };
