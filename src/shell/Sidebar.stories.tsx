import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { ASTROLIFT_MARK, ASTROLIFT_NAV } from "../examples/products.js";
import { activeFor, visibleNav } from "../nav/model.js";
import { BrandMark } from "./BrandMark.js";
import { type SidebarProps, Sidebar } from "./Sidebar.js";
import { UserMenu } from "./UserMenu.js";

/** The main rail: the one brand surface. Switch Product in the toolbar to see Zentinelle's navy. */
const meta = {
  title: "Shell/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>;
export default meta;

const nav = visibleNav(ASTROLIFT_NAV, () => true);

function Frame({
  startCollapsed = false,
  ...props
}: Partial<SidebarProps> & { startCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = React.useState(startCollapsed);
  return (
    <div className="flex h-160 bg-background">
      <Sidebar
        nav={nav}
        active={activeFor(nav, "/tasks")}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={<BrandMark href="/dashboard" mark={ASTROLIFT_MARK} />}
        headerCollapsed={<BrandMark href="/dashboard" mark={ASTROLIFT_MARK} collapsed />}
        footer={<UserMenu name="Leo Mata" email="leo@calliope.ai" onSignOut={() => {}} />}
        {...props}
      />
      <div className="p-6 text-sm text-muted-foreground">Content</div>
    </div>
  );
}

export const Expanded: StoryObj = { render: () => <Frame /> };
export const Collapsed: StoryObj = { render: () => <Frame startCollapsed /> };
export const NoFooter: StoryObj = { render: () => <Frame footer={undefined} /> };
