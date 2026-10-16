import type { Meta, StoryObj } from "@storybook/react-vite";

import * as React from "react";

import { Button } from "../primitives/Button.js";
import { StatusBadge } from "../status/StatusBadge.js";
import { AppearanceProvider, useAppearance } from "./AppearanceProvider.js";

/**
 * Holds the person's appearance for one product and keeps <html> in step.
 * Uncontrolled in an app (localStorage, other tabs follow); controlled in a
 * catalog or a test, as here.
 */
const meta = {
  title: "Appearance/AppearanceProvider",
  component: AppearanceProvider,
} satisfies Meta<typeof AppearanceProvider>;
export default meta;

function Readout() {
  const { appearance, mode, locked, personal, setAppearance, reset } = useAppearance();
  return (
    <div className="flex max-w-xl flex-col gap-3 rounded-lg border bg-card p-4 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-muted-foreground">ground</dt>
        <dd>
          {appearance.ground} ({mode})
        </dd>
        <dt className="text-muted-foreground">accent</dt>
        <dd>{appearance.accent}</dd>
        <dt className="text-muted-foreground">density</dt>
        <dd>{appearance.density}</dd>
        <dt className="text-muted-foreground">corners</dt>
        <dd>{appearance.corners}px</dd>
        <dt className="text-muted-foreground">personal</dt>
        <dd>{personal ? JSON.stringify(personal) : "none: following the org and product"}</dd>
        <dt className="text-muted-foreground">locked</dt>
        <dd>{String(locked)}</dd>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setAppearance({ accent: "copper" })}>
          Copper accent
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
        <StatusBadge tone="ok">ok stays lime</StatusBadge>
      </div>
    </div>
  );
}

/** The catalog's own provider, driven by the toolbar. */
export const FromToolbar: StoryObj = { render: () => <Readout /> };

function OrgDefaultDemo() {
  const { setPolicy } = useAppearance();
  React.useEffect(() => {
    setPolicy({ orgDefault: { ground: "charcoal", accent: "ice" } });
    return () => setPolicy(null);
  }, [setPolicy]);
  return <Readout />;
}

/** An org default applies to anyone who has not chosen: here, nobody has. */
export const OrgDefault: StoryObj = {
  render: () => <OrgDefaultDemo />,
  parameters: { appearance: { unset: true } },
};

/** Nobody has chosen and there is no org default: the product default, with light or dark following the system. */
export const ProductDefault: StoryObj = {
  render: () => <Readout />,
  parameters: { appearance: { unset: true } },
};
