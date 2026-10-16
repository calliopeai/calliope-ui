import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "./StatusBadge.js";
import { STATUS_TONES } from "./tones.js";

/**
 * The five tones. Change the accent in the toolbar: none of these move,
 * because status is semantic (operator-UI amendment, Astrolift #2126).
 */
const meta = {
  title: "Status/StatusBadge",
  component: StatusBadge,
  args: { tone: "ok", children: "running" },
} satisfies Meta<typeof StatusBadge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Ok: Story = {};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_TONES.map((tone) => (
        <StatusBadge key={tone} tone={tone}>
          {
            {
              ok: "running",
              warn: "pending approval",
              error: "failed",
              info: "deploying",
              muted: "rolled back",
            }[tone]
          }
        </StatusBadge>
      ))}
    </div>
  ),
};

/** In flight: the badge pulses; with reduced motion it holds still. */
export const InFlight: Story = { args: { tone: "info", pulse: true, children: "deploying" } };

export const Superseded: Story = { args: { tone: "muted", struck: true, children: "superseded" } };

export const LongLabel: Story = {
  render: () => (
    <div className="w-48">
      <StatusBadge tone="warn">waiting for a second approver from security</StatusBadge>
    </div>
  ),
};
