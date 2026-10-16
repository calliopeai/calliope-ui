import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderIcon, SparklesIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../primitives/Button.js";
import { PROJECTS } from "./rail.fixtures.js";
import { type RailPanelProps, RailPanel } from "./RailPanel.js";
import { RailTree } from "./RailTree.js";

/** The right rail's frame: Astrolift's projects, or Zentinelle's assistant dock. */
const meta = {
  title: "Shell/RailPanel",
  component: RailPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RailPanel>;
export default meta;

function Projects(props: Partial<RailPanelProps>) {
  const [collapsed, setCollapsed] = React.useState(props.collapsed ?? false);
  return (
    <div className="flex h-140 justify-end bg-background">
      <RailPanel
        label="Projects"
        title={<span className="text-sm font-semibold">CONFLICT</span>}
        footer={<span className="text-xs text-muted-foreground">All projects</span>}
        collapsedIcon={<FolderIcon />}
        {...props}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        <RailTree
          label="My projects"
          groups={PROJECTS}
          activeHref="/apps/checkout"
          emptyText="No projects"
        />
      </RailPanel>
    </div>
  );
}

/** Astrolift: 260px, collapsing to a strip. */
export const ProjectsRail: StoryObj = { render: () => <Projects /> };
export const ProjectsCollapsed: StoryObj = { render: () => <Projects collapsed /> };

function Dock({
  startCollapsed = false,
  startExpanded = false,
}: {
  startCollapsed?: boolean;
  startExpanded?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(startCollapsed);
  const [expanded, setExpanded] = React.useState(startExpanded);
  const [width, setWidth] = React.useState(400);
  return (
    <div className="flex h-140 bg-background">
      <div className={expanded ? "hidden" : "flex min-w-0 flex-1 flex-col items-start gap-3 p-6"}>
        <p className="text-sm text-muted-foreground">Page content, pushed aside by the dock.</p>
        {collapsed && (
          <Button variant="outline" size="sm" onClick={() => setCollapsed(false)}>
            <SparklesIcon aria-hidden /> Assistant
          </Button>
        )}
      </div>
      <RailPanel
        label="Assistant"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        collapsedMode="hidden"
        width={width}
        minWidth={320}
        maxWidth={560}
        onWidthChange={setWidth}
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        <p className="p-4 text-sm text-muted-foreground">The assistant lives here.</p>
      </RailPanel>
    </div>
  );
}

/** Zentinelle: 400px, resizable from 320 to 560 by its edge or the arrow keys, collapsing to nothing. */
export const AssistantDock: StoryObj = {
  render: () => <Dock />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize assistant" });
    await expect(handle).toHaveAttribute("aria-valuenow", "400");
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(handle).toHaveAttribute("aria-valuenow", "416");
    await userEvent.keyboard("{End}");
    await expect(handle).toHaveAttribute("aria-valuenow", "560");
  },
};

export const AssistantHidden: StoryObj = { render: () => <Dock startCollapsed /> };
export const AssistantFullWidth: StoryObj = { render: () => <Dock startExpanded /> };
