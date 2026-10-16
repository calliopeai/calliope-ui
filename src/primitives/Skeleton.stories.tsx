import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./Skeleton.js";

const meta = { title: "Primitives/Skeleton", component: Skeleton } satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Placeholders have the geometry of what they stand for, so nothing jumps when it lands. */
export const Shapes: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 flex-1" />
      </div>
    </div>
  ),
};
