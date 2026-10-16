import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../primitives/Button.js";
import { Input } from "../primitives/Input.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog.js";

const meta = { title: "Overlays/Dialog", component: Dialog } satisfies Meta<typeof Dialog>;
export default meta;

type Story = StoryObj<typeof meta>;

function RenameDialog({ open }: { open?: boolean }) {
  return (
    <Dialog defaultOpen={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Rename app</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename checkout</DialogTitle>
          <DialogDescription>
            The URL changes with the name; old links redirect for 30 days.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rename-app" className="text-sm font-medium">
            New name
          </label>
          <Input id="rename-app" defaultValue="checkout" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Closed: Story = { render: () => <RenameDialog /> };
export const Open: Story = { render: () => <RenameDialog open /> };

export const LongContent: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            What changes when you promote this build to production across every region
          </DialogTitle>
          <DialogDescription>
            {"The build replaces the running one in us-west-2, eu-central-1 and ap-southeast-2. ".repeat(
              6
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Promote</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
