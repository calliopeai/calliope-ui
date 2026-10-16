import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusDot } from "./StatusDot.js";
import { STATUS_TONES } from "./tones.js";

const meta = {
  title: "Status/StatusDot",
  component: StatusDot,
  args: { tone: "ok" },
} satisfies Meta<typeof StatusDot>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AllTones: Story = {
  render: () => (
    <ul className="flex flex-col gap-2 text-sm">
      {STATUS_TONES.map((tone) => (
        <li key={tone} className="flex items-center gap-2">
          <StatusDot tone={tone} /> {tone}
        </li>
      ))}
    </ul>
  ),
};

export const Pulsing: Story = { args: { tone: "info", pulse: true, label: "deploying" } };

/** Standing alone, a dot carries its status in words for screen readers. */
export const WithLabel: Story = { args: { tone: "error", label: "failing" } };
