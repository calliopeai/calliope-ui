import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Checkbox } from "./Checkbox.js";

const meta = { title: "Primitives/Checkbox", component: Checkbox } satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

function Labelled({ checked }: { checked: boolean | "indeterminate" }) {
  const [value, setValue] = React.useState(checked);
  const id = React.useId();
  return (
    <div className="flex items-center gap-2 text-sm">
      <Checkbox id={id} checked={value} onCheckedChange={setValue} />
      <label htmlFor={id}>Notify me when a deployment fails</label>
    </div>
  );
}

export const Unchecked: Story = { render: () => <Labelled checked={false} /> };
export const Checked: Story = { render: () => <Labelled checked /> };
/** The header box of a table when some rows on the page are selected. */
export const Indeterminate: Story = { render: () => <Labelled checked="indeterminate" /> };
export const Disabled: Story = { args: { disabled: true, "aria-label": "Unavailable" } };
