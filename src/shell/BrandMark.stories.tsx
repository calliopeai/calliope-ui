import type { Meta, StoryObj } from "@storybook/react-vite";

import { ASTROLIFT_MARK, ZENTINELLE_MARK } from "../examples/products.js";
import { BrandMark } from "./BrandMark.js";

/** The product's name comes from the product in context; switch Product in the toolbar. */
const meta = {
  title: "Shell/BrandMark",
  component: BrandMark,
  args: { href: "/dashboard", mark: ASTROLIFT_MARK },
  decorators: [
    (Story) => (
      <div className="w-55 rounded-lg bg-sidebar p-3 text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandMark>;
export default meta;

type Story = StoryObj<typeof meta>;

export const FromProduct: Story = {};
export const Zentinelle: Story = { args: { name: "Zentinelle AI", mark: ZENTINELLE_MARK } };
export const NameOnly: Story = { args: { mark: undefined } };
export const Collapsed: Story = { args: { collapsed: true } };
