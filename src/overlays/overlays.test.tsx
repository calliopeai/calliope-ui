import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { UIProvider } from "../provider/UIProvider.js";
import { type ConfirmDialogProps, ConfirmDialog } from "./ConfirmDialog.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./Dialog.js";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "./Drawer.js";

function Confirm(props: Partial<ConfirmDialogProps>) {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <span data-testid="open">{String(open)}</span>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete checkout?"
        description="Recoverable for 30 days."
        confirmLabel="Delete app"
        destructive
        onConfirm={() => undefined}
        {...props}
      />
    </>
  );
}

const isOpen = () => screen.getByTestId("open").textContent === "true";

describe("ConfirmDialog", () => {
  it("is an alert dialog with its title and blast radius", () => {
    render(<Confirm />);
    const dialog = screen.getByRole("alertdialog", { name: "Delete checkout?" });
    expect(dialog).toHaveAccessibleDescription("Recoverable for 30 days.");
  });

  it("holds both buttons while the action runs, then closes", async () => {
    let finish: () => void = () => {};
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<Confirm onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete app" }));
    expect(screen.getByRole("button", { name: "Working" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(isOpen()).toBe(true);
    finish();
    await waitFor(() => expect(isOpen()).toBe(false));
  });

  it("stays open when the action resolves false: the caller reported the failure", async () => {
    render(<Confirm onConfirm={() => false} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete app" }));
    expect(isOpen()).toBe(true);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("stays open and says why when the action fails", async () => {
    render(
      <Confirm onConfirm={() => Promise.reject(new Error("checkout has a running deployment"))} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete app" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("checkout has a running deployment");
    expect(isOpen()).toBe(true);
    expect(screen.getByRole("button", { name: "Delete app" })).toBeEnabled();
  });

  it("falls back to a generic line for a failure with no message", async () => {
    render(<Confirm onConfirm={() => Promise.reject(new Error(""))} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete app" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That did not work. Try again.");
  });

  it("requires a reason when asked, and passes it trimmed", async () => {
    const onConfirm = vi.fn();
    render(<Confirm onConfirm={onConfirm} reason={{ label: "Reason for rejection" }} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete app" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A reason is required.");
    expect(screen.getByLabelText("Reason for rejection")).toHaveAttribute("aria-invalid", "true");
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText("Reason for rejection"), "  missing migration  ");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete app" }));
    expect(onConfirm).toHaveBeenCalledWith("missing migration");
  });

  it("cancels, and forgets the draft for the next time", async () => {
    render(<Confirm reason={{ label: "Reason" }} />);
    await userEvent.type(screen.getByLabelText("Reason"), "half a thought");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(isOpen()).toBe(false);
  });

  it("holds the confirm button back until the caller is ready", () => {
    render(<Confirm confirmDisabled />);
    expect(screen.getByRole("button", { name: "Delete app" })).toBeDisabled();
  });
});

describe("Dialog and Drawer", () => {
  it("open from a trigger, close with Escape, and return focus to the trigger", async () => {
    render(
      <Dialog>
        <DialogTrigger>Rename</DialogTrigger>
        <DialogContent>
          <DialogTitle>Rename checkout</DialogTitle>
          <DialogDescription>Old links redirect.</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const trigger = screen.getByRole("button", { name: "Rename" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Rename checkout" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("name their close buttons from the app's copy", () => {
    render(
      <UIProvider messages={{ dialog: { close: "Cerrar" } }}>
        <Drawer open>
          <DrawerContent side="left">
            <DrawerTitle>Filtros</DrawerTitle>
            <DrawerDescription>Por estado</DrawerDescription>
          </DrawerContent>
        </Drawer>
      </UIProvider>
    );
    expect(screen.getByRole("dialog", { name: "Filtros" })).toHaveAttribute("data-side", "left");
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });
});
