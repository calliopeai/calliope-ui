import type { Meta, StoryObj } from "@storybook/react-vite";
import { BotIcon, RotateCcwIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../primitives/Button.js";
import { DropdownMenuItem } from "../primitives/DropdownMenu.js";
import { StatusBadge } from "../status/StatusBadge.js";
import { DataTable } from "./DataTable.js";
import { RUN_TONE, RUNS, type RunRow, fixtureController } from "./table.fixtures.js";
import type { Column, TableController } from "./types.js";
import { useRowSelection } from "./use-row-selection.js";

/** The list surface, in every state. Switch Density in the toolbar: Cards boxes the rows. */
const meta = {
  title: "Data/DataTable",
  component: DataTable,
} satisfies Meta<typeof DataTable>;
export default meta;

const COLUMNS: Column<RunRow>[] = [
  { id: "id", header: "Run", cell: (r) => <span className="font-mono">{r.id}</span> },
  { id: "agent", header: "Agent", cell: (r) => r.agent, sortKey: "agent" },
  {
    id: "status",
    header: "Status",
    cell: (r) => (
      <StatusBadge tone={RUN_TONE[r.status]} pulse={r.status === "running"}>
        {r.status}
      </StatusBadge>
    ),
  },
  {
    id: "took",
    header: "Took",
    cell: (r) =>
      r.took ? (
        <span className="font-mono">{r.took}</span>
      ) : (
        <span className="text-muted-foreground">not started</span>
      ),
    align: "right",
  },
  { id: "trigger", header: "Trigger", cell: (r) => r.trigger },
  { id: "started", header: "Started", cell: (r) => r.started, sortKey: "started" },
];

const EMPTY = {
  icon: <BotIcon />,
  title: "No runs yet",
  description: "Runs appear here when an agent is triggered.",
  actionHref: "/agents",
  actionLabel: "Run an agent",
};

function RunCard(row: RunRow) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium">{row.id}</span>
        <StatusBadge tone={RUN_TONE[row.status]}>{row.status}</StatusBadge>
      </div>
      <p className="text-sm">{row.agent}</p>
      <p className="mt-auto text-xs text-muted-foreground">
        {row.trigger} · {row.started}
      </p>
    </div>
  );
}

function Runs({
  state,
  rows = RUNS,
}: {
  state?: Partial<TableController<RunRow>>;
  rows?: RunRow[];
}) {
  return (
    <DataTable
      label="Runs"
      controller={fixtureController<RunRow>({ rows, totalCount: rows.length, ...state })}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      rowHref={(r) => `/tasks/${r.id}`}
      rowLabel={(r) => `run ${r.id}`}
      renderCard={RunCard}
      empty={EMPTY}
      emptyFiltered={{ title: "No runs match", description: "Clear a filter to see more." }}
      searchPlaceholder="Search runs, ids"
    />
  );
}

export const Ready: StoryObj = { render: () => <Runs /> };
export const Loading: StoryObj = {
  render: () => <Runs state={{ state: "loading", totalCount: null }} rows={[]} />,
};
export const Empty: StoryObj = {
  render: () => <Runs state={{ state: "empty", totalCount: null }} rows={[]} />,
};
export const EmptyFiltered: StoryObj = {
  render: () => (
    <Runs
      state={{ state: "emptyFiltered", isFiltered: true, search: "zzz", totalCount: 0 }}
      rows={[]}
    />
  ),
};
export const ErrorState: StoryObj = {
  render: () => (
    <Runs
      state={{
        state: "error",
        error: { message: "upstream timed out after 30s" },
        totalCount: null,
      }}
      rows={[]}
    />
  ),
};
export const Paged: StoryObj = {
  render: () => <Runs state={{ totalCount: 140, hasNext: true, hasPrev: true, pageIndex: 1 }} />,
};
/** Rows answering the previous question stay on screen, faded, until the next answer lands. */
export const Stale: StoryObj = {
  render: () => <Runs state={{ isStale: true, search: "support" }} />,
};
export const MultiKeySort: StoryObj = {
  render: () => (
    <Runs
      state={{
        sort: [
          { key: "agent", dir: "asc" },
          { key: "started", dir: "desc" },
        ],
      }}
    />
  ),
};

export const Cards: StoryObj = {
  render: () => (
    <DataTable
      label="Runs"
      density="cards"
      controller={fixtureController<RunRow>({ rows: RUNS })}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      rowHref={(r) => `/tasks/${r.id}`}
      renderCard={RunCard}
      empty={EMPTY}
    />
  ),
};

function WithSelectionDemo() {
  const selection = useRowSelection();
  return (
    <DataTable
      label="Runs"
      controller={fixtureController<RunRow>({ rows: RUNS })}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      rowHref={(r) => `/tasks/${r.id}`}
      rowLabel={(r) => `run ${r.id}`}
      empty={EMPTY}
      selection={selection}
      bulkActions={(s) => (
        <Button size="sm" variant="outline">
          <RotateCcwIcon aria-hidden /> Retry {s.selectedCount}
        </Button>
      )}
      rowActions={(r) => (
        <>
          <DropdownMenuItem>Open logs for {r.id}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Cancel run</DropdownMenuItem>
        </>
      )}
    />
  );
}

export const WithSelection: StoryObj = {
  render: () => <WithSelectionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select run 7e11b0c4" }));
    await expect(canvas.getByText("1 selected")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select all runs on this page" }));
    await expect(canvas.getByText(`${RUNS.length} selected`)).toBeInTheDocument();
  },
};

/** Rows that act in place are buttons named after the row, never fake links. */
export const RowsAsButtons: StoryObj = {
  render: () => (
    <DataTable
      label="Runs"
      controller={fixtureController<RunRow>({ rows: RUNS, searchEnabled: false })}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      onRowActivate={fn()}
      rowLabel={(r) => `Open run ${r.id}`}
      empty={EMPTY}
    />
  ),
};

export const LongValues: StoryObj = {
  render: () => (
    <div className="w-192">
      <Runs
        rows={RUNS.map((r) => ({
          ...r,
          agent: `${r.agent}-with-a-very-long-name-that-does-not-break`,
        }))}
      />
    </div>
  ),
};
