import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./Input.js";

const meta = {
  title: "Primitives/Input",
  component: Input,
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-1.5">
      <label htmlFor="story-input" className="text-sm font-medium">
        App name
      </label>
      <Input id="story-input" {...args} />
    </div>
  ),
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { placeholder: "checkout" } };
export const Filled: Story = { args: { defaultValue: "billing-api" } };
export const Invalid: Story = { args: { defaultValue: "Billing API", "aria-invalid": true } };
export const Disabled: Story = { args: { defaultValue: "billing-api", disabled: true } };
