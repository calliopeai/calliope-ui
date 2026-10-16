import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import { ASTROLIFT_MARK, ASTROLIFT_NAV } from "../examples/products.js";
import { activeFor, visibleNav } from "../nav/model.js";
import { PageHeader } from "../page/PageHeader.js";
import { Input } from "../primitives/Input.js";
import { AppShell } from "./AppShell.js";
import { BrandMark } from "./BrandMark.js";
import { PROJECTS } from "./rail.fixtures.js";
import { RailPanel } from "./RailPanel.js";
import { RailTree } from "./RailTree.js";
import { Sidebar } from "./Sidebar.js";
import { UserMenu } from "./UserMenu.js";

/** The frame: sidebar, content, right rail. Press `[` and `]`. Each region scrolls on its own. */
const meta = {
  title: "Shell/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppShell>;
export default meta;

const nav = visibleNav(ASTROLIFT_NAV, () => true);

function Demo({
  rail = true,
  header = false,
  banner = false,
  startRailCollapsed = false,
}: {
  rail?: boolean;
  header?: boolean;
  banner?: boolean;
  startRailCollapsed?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [railCollapsed, setRailCollapsed] = React.useState(startRailCollapsed);
  const sidebar = (
    <Sidebar
      nav={nav}
      active={activeFor(nav, "/apps/checkout")}
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      header={<BrandMark href="/dashboard" mark={ASTROLIFT_MARK} />}
      headerCollapsed={<BrandMark href="/dashboard" mark={ASTROLIFT_MARK} collapsed />}
      footer={<UserMenu name="Leo Mata" email="leo@calliope.ai" onSignOut={() => {}} />}
    />
  );
  const content = (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Apps", href: "/apps" }, { label: "checkout" }]}
        title="checkout"
        context="production · us-west-2"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <p key={i} className="max-w-2xl text-sm text-muted-foreground">
          Content scrolls inside the main region, and the rails stay put.
        </p>
      ))}
    </div>
  );
  const shared = {
    sidebar,
    onToggleSidebar: () => setSidebarCollapsed((c) => !c),
    header: header ? (
      <div className="relative w-full max-w-sm">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input aria-label="Search everything" placeholder="Search everything" className="pl-8" />
      </div>
    ) : undefined,
    banner: banner ? (
      <div
        role="status"
        className="border-b border-warning-border bg-warning-bg px-4 py-2 text-sm text-warning-fg"
      >
        Deploys are delayed in us-west-2 while a provider incident is investigated.
      </div>
    ) : undefined,
  };
  if (!rail) return <AppShell {...shared}>{content}</AppShell>;
  return (
    <AppShell
      {...shared}
      rightRail={
        <RailPanel
          label="Projects"
          title="CONFLICT"
          collapsed={railCollapsed}
          onCollapsedChange={setRailCollapsed}
          collapsedIcon={<FolderIcon />}
        >
          <RailTree
            label="My projects"
            groups={PROJECTS}
            activeHref="/apps/checkout"
            emptyText="No projects"
          />
        </RailPanel>
      }
      rightRailLabel="Projects"
      onToggleRightRail={() => setRailCollapsed((c) => !c)}
    >
      {content}
    </AppShell>
  );
}

export const BothRails: StoryObj = { render: () => <Demo /> };
export const RightRailCollapsed: StoryObj = { render: () => <Demo startRailCollapsed /> };
export const SidebarOnly: StoryObj = { render: () => <Demo rail={false} /> };
export const WithHeaderAndBanner: StoryObj = { render: () => <Demo header banner /> };

/** Below `md` the rails move into drawers, opened from the top bar. */
export const Mobile: StoryObj = {
  render: () => <Demo header />,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
