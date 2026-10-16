import type { Meta, StoryObj } from "@storybook/react-vite";
import { BotIcon } from "lucide-react";

import { DataTable } from "../data/DataTable.js";
import { RUN_TONE, RUNS, type RunRow, fixtureController } from "../data/table.fixtures.js";
import type { Column, TableController } from "../data/types.js";
import { ASTROLIFT_NAV } from "../examples/products.js";
import { areaSwitcher } from "../nav/model.js";
import { Button } from "../primitives/Button.js";
import { StatusBadge } from "../status/StatusBadge.js";
import { ErrorState } from "../states/ErrorState.js";
import { type PageFrameProps, PageFrame } from "./PageFrame.js";
import { Section } from "./Section.js";

/** A whole page: header, filter bar, body. When a page has a list, the list is the page. */
const meta = {
  title: "Page/PageFrame",
  component: PageFrame,
} satisfies Meta<typeof PageFrame>;
export default meta;

const COLUMNS: Column<RunRow>[] = [
  { id: "id", header: "Run", cell: (r) => <span className="font-mono">{r.id}</span> },
  { id: "agent", header: "Agent", cell: (r) => r.agent, sortKey: "agent" },
  {
    id: "status",
    header: "Status",
    cell: (r) => <StatusBadge tone={RUN_TONE[r.status]}>{r.status}</StatusBadge>,
  },
  { id: "started", header: "Started", cell: (r) => r.started, sortKey: "started" },
];

const VIEWS = ["All", "Mine", "Failed", "Scheduled"].map((label, i) => ({
  key: label.toLowerCase(),
  label,
  href: `?view=${label.toLowerCase()}`,
  active: i === 0,
}));

function RunsPage({
  state,
  rows = RUNS,
  header,
}: {
  state?: Partial<TableController<RunRow>>;
  rows?: RunRow[];
  header?: Partial<PageFrameProps>;
}) {
  return (
    <PageFrame
      crumbs={[areaSwitcher(ASTROLIFT_NAV, "agents", "runs")]}
      title="Runs"
      primaryAction={<Button size="sm">Run an agent</Button>}
      tabs={VIEWS}
      tabsLabel="Views"
      {...header}
    >
      <DataTable
        label="Runs"
        controller={fixtureController<RunRow>({ rows, totalCount: rows.length, ...state })}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        rowHref={(r) => `/tasks/${r.id}`}
        empty={{
          icon: <BotIcon />,
          title: "No runs yet",
          description: "Runs appear here when an agent is triggered.",
          actionHref: "/agents",
          actionLabel: "Run an agent",
        }}
        searchPlaceholder="Search runs, ids"
      />
    </PageFrame>
  );
}

export const Full: StoryObj = { render: () => <RunsPage /> };
export const Loading: StoryObj = {
  render: () => <RunsPage state={{ state: "loading", totalCount: null }} rows={[]} />,
};
export const Empty: StoryObj = {
  render: () => <RunsPage state={{ state: "empty", totalCount: null }} rows={[]} />,
};
export const ErrorPage: StoryObj = {
  render: () => (
    <RunsPage
      state={{ state: "error", error: { message: "upstream timed out" }, totalCount: null }}
      rows={[]}
    />
  ),
};

/** A detail page: sections under the entity's tabs; a failed panel says so in place. */
export const Detail: StoryObj = {
  render: () => (
    <PageFrame
      crumbs={[areaSwitcher(ASTROLIFT_NAV, "agents", "agents"), { label: "support-bot" }]}
      title="support-bot"
      status={<StatusBadge tone="ok">running</StatusBadge>}
      context="claude-sonnet · us-west-2"
      primaryAction={<Button size="sm">Run now</Button>}
      tabs={["Overview", "Runs", "Build", "Control", "Settings"].map((label, i) => ({
        key: label,
        label,
        href: "#",
        active: i === 0,
      }))}
      tabsLabel="Agent"
    >
      <Section title="Recent runs" description="The last five; the Runs tab has the rest.">
        <ErrorState
          title="Could not load recent runs"
          error="The run history service is unavailable."
          onRetry={() => {}}
        />
      </Section>
    </PageFrame>
  ),
};

export const WithFiltersAndNotice: StoryObj = {
  render: () => (
    <RunsPage
      header={{
        notice: (
          <p className="rounded-lg border border-info-border bg-info-bg px-3 py-2 text-sm text-info-fg">
            Scheduled runs move to UTC on Monday; local schedules convert automatically.
          </p>
        ),
        filters: (
          <>
            <Button size="sm" variant="outline">
              Status: any
            </Button>
            <Button size="sm" variant="outline">
              Trigger: any
            </Button>
          </>
        ),
      }}
    />
  ),
};

export const LongStrings: StoryObj = {
  render: () => (
    <RunsPage
      header={{
        title: "Runs for every agent in the storefront project and the data platform project",
        description:
          "A description long enough to wrap, so the header's rhythm can be checked with two lines of copy under the title row.",
      }}
      rows={RUNS.map((r) => ({ ...r, agent: `${r.agent}-with-a-name-that-keeps-going` }))}
    />
  ),
};

/** The tablet width every screen is checked at. */
export const Width768: StoryObj = {
  render: () => (
    <div className="w-192">
      <RunsPage />
    </div>
  ),
};
