import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BellIcon,
  BookOpenIcon,
  DownloadIcon,
  FolderIcon,
  KeyRoundIcon,
  MoreHorizontalIcon,
  PackageIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { DataTable } from "../data/DataTable.js";
import { List, ListItem } from "../data/List.js";
import { fixtureController } from "../data/table.fixtures.js";
import type { Column, TableController } from "../data/types.js";
import { activeFor, areaSwitcher, visibleNav } from "../nav/model.js";
import { PageFrame } from "../page/PageFrame.js";
import { Section } from "../page/Section.js";
import { Button } from "../primitives/Button.js";
import { useUI } from "../provider/UIProvider.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu.js";
import { AppShell } from "../shell/AppShell.js";
import { BrandMark } from "../shell/BrandMark.js";
import { PROJECTS } from "../shell/rail.fixtures.js";
import { RailPanel } from "../shell/RailPanel.js";
import { RailTree } from "../shell/RailTree.js";
import { Sidebar } from "../shell/Sidebar.js";
import { UserMenu } from "../shell/UserMenu.js";
import { EmptyState } from "../states/EmptyState.js";
import { StatusBadge } from "../status/StatusBadge.js";
import type { StatusTone } from "../status/tones.js";
import { ASTROLIFT_MARK, ASTROLIFT_NAV } from "./products.js";
import { ExampleRouter, usePath } from "./router.js";

/**
 * Astrolift AI, whole: layout D (main rail, content, projects rail) with the
 * Apps list and an app's detail page. The sidebar, the breadcrumb switcher
 * and the projects tree navigate inside the story; `[` and `]` fold the rails.
 */
const meta = {
  title: "Examples/Astrolift shell",
  parameters: { layout: "fullscreen" },
  globals: { product: "astrolift" },
} satisfies Meta;
export default meta;

interface AppRow {
  slug: string;
  project: string;
  status: "running" | "failed" | "deploying" | "paused";
  environment: string;
  deployed: string;
}

const APPS: AppRow[] = [
  {
    slug: "checkout",
    project: "storefront",
    status: "running",
    environment: "production",
    deployed: "12m ago",
  },
  {
    slug: "billing-api",
    project: "storefront",
    status: "failed",
    environment: "production",
    deployed: "40m ago",
  },
  {
    slug: "ingest",
    project: "data-platform",
    status: "deploying",
    environment: "staging",
    deployed: "just now",
  },
  {
    slug: "status-board",
    project: "internal-tools",
    status: "paused",
    environment: "production",
    deployed: "6d ago",
  },
];

const APP_TONE: Record<AppRow["status"], StatusTone> = {
  running: "ok",
  failed: "error",
  deploying: "info",
  paused: "muted",
};

const APP_COLUMNS: Column<AppRow>[] = [
  {
    id: "slug",
    header: "App",
    cell: (a) => <span className="font-medium">{a.slug}</span>,
    sortKey: "name",
  },
  { id: "project", header: "Project", cell: (a) => a.project },
  {
    id: "status",
    header: "Status",
    cell: (a) => (
      <StatusBadge tone={APP_TONE[a.status]} pulse={a.status === "deploying"}>
        {a.status}
      </StatusBadge>
    ),
  },
  {
    id: "environment",
    header: "Environment",
    cell: (a) => <span className="font-mono">{a.environment}</span>,
  },
  { id: "deployed", header: "Last deploy", cell: (a) => a.deployed, sortKey: "deployed" },
];

const nav = visibleNav(ASTROLIFT_NAV, () => true);

function AppsPage({ state }: { state?: Partial<TableController<AppRow>> }) {
  return (
    <PageFrame
      crumbs={[areaSwitcher(nav, "apps", "apps")]}
      title="Apps"
      primaryAction={<Button size="sm">New app</Button>}
      tabs={[
        { key: "all", label: "All", href: "?view=all", active: true },
        { key: "mine", label: "Mine", href: "?view=mine", active: false },
        { key: "failing", label: "Failing", href: "?view=failing", active: false },
      ]}
      tabsLabel="Views"
    >
      <DataTable
        label="Apps"
        controller={fixtureController<AppRow>({
          rows: APPS,
          totalCount: APPS.length,
          sort: { key: "name", dir: "asc" },
          ...state,
        })}
        columns={APP_COLUMNS}
        getRowId={(a) => a.slug}
        rowHref={(a) => `/apps/${a.slug}`}
        renderCard={(a) => (
          <div className="flex h-full flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{a.slug}</span>
              <StatusBadge tone={APP_TONE[a.status]}>{a.status}</StatusBadge>
            </div>
            <p className="mt-auto font-mono text-xs text-muted-foreground">
              {a.project} · {a.environment}
            </p>
          </div>
        )}
        empty={{
          icon: <PackageIcon />,
          title: "No apps yet",
          description: "Connect a repository and Astrolift AI builds and deploys it.",
          actionHref: "/apps/new",
          actionLabel: "New app",
        }}
        searchPlaceholder="Search apps"
      />
    </PageFrame>
  );
}

function AppDetailPage({ slug }: { slug: string }) {
  const app = APPS.find((a) => a.slug === slug) ?? APPS[0]!;
  return (
    <PageFrame
      crumbs={[areaSwitcher(nav, "apps", "apps"), { label: app.slug }]}
      title={app.slug}
      status={<StatusBadge tone={APP_TONE[app.status]}>{app.status}</StatusBadge>}
      context={`${app.environment} · us-west-2`}
      primaryAction={<Button size="sm">Deploy</Button>}
      menu={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" aria-label={`More actions for ${app.slug}`}>
              <MoreHorizontalIcon aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Pause deploys</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete app</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      tabs={["Overview", "Deployments", "Workloads", "Logs & metrics", "Settings"].map(
        (label, i) => ({
          key: label,
          label,
          href: "#",
          active: i === 0,
        })
      )}
      tabsLabel="App"
    >
      <Section title="Environments" description="Where this app runs.">
        <List
          label="Environments"
          items={[
            { name: "production", region: "us-west-2", build: "412", tone: APP_TONE[app.status] },
            { name: "staging", region: "us-west-2", build: "415", tone: "ok" as StatusTone },
            {
              name: "preview-pr-918",
              region: "us-east-1",
              build: "416",
              tone: "info" as StatusTone,
            },
          ]}
          getKey={(e) => e.name}
          empty={{ title: "No environments" }}
          renderItem={(e) => (
            <ListItem
              title={e.name}
              href={`/environments/${e.name}`}
              description={e.region}
              meta={`build ${e.build}`}
              status={
                <StatusBadge tone={e.tone}>
                  {e.tone === "ok" ? "healthy" : e.tone === "info" ? "building" : "failing"}
                </StatusBadge>
              }
            />
          )}
        />
      </Section>
    </PageFrame>
  );
}

function AllProjectsLink() {
  const { Link } = useUI();
  return (
    <Link
      href="/projects"
      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
    >
      All projects
    </Link>
  );
}

function FunctionPage({ label }: { label: string }) {
  return (
    <PageFrame title={label}>
      <EmptyState
        title={`No ${label.toLowerCase()} in this example`}
        description="The example shell has two pages: Apps and an app's detail."
        actionHref="/apps"
        actionLabel="Back to Apps"
      />
    </PageFrame>
  );
}

function Pages({ state }: { state?: Partial<TableController<AppRow>> }) {
  const { path } = usePath();
  if (path === "/apps") return <AppsPage state={state} />;
  if (path.startsWith("/apps/")) return <AppDetailPage slug={path.slice("/apps/".length)} />;
  const active = activeFor(nav, path);
  const label = nav
    .flatMap((a) => a.groups.flatMap((g) => g.functions))
    .find((f) => f.key === active?.fn)?.label;
  return <FunctionPage label={label ?? "Page"} />;
}

function Shell({
  startSidebarCollapsed = false,
  startRailCollapsed = false,
  state,
}: {
  startSidebarCollapsed?: boolean;
  startRailCollapsed?: boolean;
  state?: Partial<TableController<AppRow>>;
}) {
  const { path } = usePath();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(startSidebarCollapsed);
  const [railCollapsed, setRailCollapsed] = React.useState(startRailCollapsed);
  return (
    <AppShell
      onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
      onToggleRightRail={() => setRailCollapsed((c) => !c)}
      sidebar={
        <Sidebar
          nav={nav}
          active={activeFor(nav, path)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          header={<BrandMark href="/dashboard" mark={ASTROLIFT_MARK} />}
          headerCollapsed={<BrandMark href="/dashboard" mark={ASTROLIFT_MARK} collapsed />}
          footer={
            <UserMenu
              name="Leo Mata"
              email="leo@calliope.ai"
              onSignOut={() => {}}
              groups={[
                [
                  { label: "Profile", href: "/settings/profile", icon: UserIcon },
                  { label: "Security", href: "/settings/security", icon: ShieldIcon },
                  { label: "Notifications", href: "/settings/notifications", icon: BellIcon },
                  { label: "API keys", href: "/tokens", icon: KeyRoundIcon },
                ],
                [
                  { label: "Documentation", href: "/documentation", icon: BookOpenIcon },
                  { label: "Downloads", href: "/downloads", icon: DownloadIcon },
                ],
              ]}
            />
          }
        />
      }
      rightRail={
        <RailPanel
          label="Projects"
          title="CONFLICT"
          collapsed={railCollapsed}
          onCollapsedChange={setRailCollapsed}
          collapsedIcon={<FolderIcon />}
          footer={<AllProjectsLink />}
        >
          <RailTree
            label="My projects"
            groups={PROJECTS}
            activeHref={path}
            emptyText="You are not in a project yet."
          />
        </RailPanel>
      }
      rightRailLabel="Projects"
    >
      <Pages state={state} />
    </AppShell>
  );
}

export const AppsList: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/apps">
      <Shell />
    </ExampleRouter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getAllByRole("navigation", { name: "Main" })[0]!;
    await expect(within(sidebar).getByRole("link", { name: "Apps" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    // Follow the first row to the app's page; the rail tree lights it.
    await userEvent.click(canvas.getByRole("link", { name: /^checkout/ }));
    await expect(
      await canvas.findByRole("heading", { level: 1, name: "checkout" })
    ).toBeInTheDocument();
  },
};

export const AppDetail: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/apps/checkout">
      <Shell />
    </ExampleRouter>
  ),
};

export const Loading: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/apps">
      <Shell state={{ state: "loading", rows: [], totalCount: null }} />
    </ExampleRouter>
  ),
};

export const RailsCollapsed: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/apps">
      <Shell startSidebarCollapsed startRailCollapsed />
    </ExampleRouter>
  ),
};

/** Cards density: the apps list boxes its rows into columns. */
export const CardsDensity: StoryObj = {
  globals: { density: "cards" },
  render: () => (
    <ExampleRouter initialPath="/apps">
      <Shell />
    </ExampleRouter>
  ),
};

/** Light: the mist ground, neutral sidebar, deeper green. */
export const Daylight: StoryObj = {
  globals: { ground: "mist" },
  render: () => (
    <ExampleRouter initialPath="/apps/checkout">
      <Shell />
    </ExampleRouter>
  ),
};

export const Mobile: StoryObj = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <ExampleRouter initialPath="/apps">
      <Shell />
    </ExampleRouter>
  ),
};
