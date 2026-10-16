import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { Button } from "../primitives/Button.js";
import { type ConfirmDialogProps, ConfirmDialog } from "./ConfirmDialog.js";

const meta = {
  title: "Overlays/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    title: "Delete checkout?",
    description: "Soft delete: an org owner can restore it for 30 days. Its deployments stop now.",
    confirmLabel: "Delete app",
    destructive: true,
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The trigger and the dialog together, with the open state owned by the story. */
function Harness(props: Omit<ConfirmDialogProps, "open" | "onOpenChange">) {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete app
      </Button>
      <ConfirmDialog {...props} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const Destructive: Story = {};

export const Neutral: Story = {
  args: {
    title: "Promote build 412 to production?",
    description: "It replaces build 409 in every production region.",
    confirmLabel: "Promote",
    destructive: false,
  },
};

/** An action the audit trail must explain asks for a reason, and refuses an empty one. */
export const WithReason: Story = {
  args: {
    title: "Reject this deployment?",
    description: undefined,
    confirmLabel: "Reject",
    reason: { label: "Reason for rejection", placeholder: "What has to change before it ships" },
  },
  render: (args) => <Harness {...args} />,
  play: async ({ args }) => {
    await userEvent.click(await screen.findByRole("button", { name: "Reject" }));
    await expect(await screen.findByRole("alert")).toHaveTextContent("A reason is required.");
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText("Reason for rejection"), "Missing the migration");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    await expect(args.onConfirm).toHaveBeenCalledWith("Missing the migration");
  },
};

/** The action fails: the dialog stays open and says why. */
export const Failing: Story = {
  args: {
    onConfirm: fn(() =>
      Promise.reject(new Error("checkout has a running deployment; stop it first"))
    ),
  },
  render: (args) => <Harness {...args} />,
  play: async () => {
    await userEvent.click(await screen.findByRole("button", { name: "Delete app" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "checkout has a running deployment; stop it first"
      )
    );
    await expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  },
};

export const ConfirmHeldBack: Story = { args: { confirmDisabled: true } };
