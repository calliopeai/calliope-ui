import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingState } from "./LoadingState.js";

const meta = { title: "States/LoadingState", component: LoadingState } satisfies Meta<
  typeof LoadingState
>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A list on its way: hairline rows, in the density's rhythm. */
export const Rows: Story = { args: { label: "Loading integrations" } };

/** A route on its way: stat tiles over two panels. */
export const Page: Story = { args: { variant: "page" } };
