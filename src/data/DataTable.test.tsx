import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenuItem } from "../primitives/DropdownMenu.js";
import { DataTable, type DataTableProps } from "./DataTable.js";
import { RUNS, type RunRow, fixtureController } from "./table.fixtures.js";
import type { Column, TableController } from "./types.js";
import { useRowSelection } from "./use-row-selection.js";

const COLUMNS: Column<RunRow>[] = [
  { id: "id", header: "Run", cell: (r) => r.id, width: "w-32" },
  { id: "agent", header: "Agent", cell: (r) => r.agent, sortKey: "agent" },
  { id: "started", header: "Started", cell: (r) => r.started, sortKey: "started" },
];

const EMPTY = {
  title: "No runs yet",
  description: "Runs appear when an agent is triggered.",
  actionHref: "/agents",
  actionLabel: "Run an agent",
};

function renderTable(
  controller: Partial<TableController<RunRow>> = {},
  props: Partial<DataTableProps<RunRow>> = {}
) {
  const c = fixtureController<RunRow>({ rows: RUNS, ...controller });
  render(
    <DataTable
      label="Runs"
      controller={c}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      empty={EMPTY}
      {...(props as object)}
    />
  );
  return c;
}

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]!).getAllByRole("row");

describe("DataTable states", () => {
  it("ready: a captioned table with a row per item", () => {
    renderTable();
    expect(screen.getByRole("table", { name: "Runs" })).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(RUNS.length);
  });

  it("loading: skeleton rows inside the real table, at most eight, and a status for screen readers", () => {
    renderTable({ state: "loading", rows: [], pageSize: 25 });
    expect(bodyRows()).toHaveLength(8);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(screen.getByRole("table").closest("[aria-busy]")).toHaveAttribute("aria-busy", "true");
  });

  it("empty: the create action, never nothing", () => {
    renderTable({ state: "empty", rows: [] });
    expect(screen.getByText("No runs yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Run an agent" })).toHaveAttribute("href", "/agents");
  });

  it("emptyFiltered: different words, and a way to clear the search", async () => {
    const clearFilters = vi.fn();
    renderTable({ state: "emptyFiltered", rows: [], isFiltered: true, clearFilters });
    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(screen.queryByText("No runs yet")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(clearFilters).toHaveBeenCalled();
  });

  it("error: an alert naming what failed, with retry", async () => {
    const retry = vi.fn();
    renderTable({ state: "error", rows: [], error: { message: "upstream timed out" }, retry });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not load runs");
    expect(alert).toHaveTextContent("upstream timed out");
    await userEvent.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalled();
  });

  it("stale rows stay on screen at full contrast, marked busy, under a progress line", () => {
    renderTable({ isStale: true });
    expect(bodyRows()).toHaveLength(RUNS.length);
    const frame = screen.getByRole("table").closest("[aria-busy]")!;
    expect(frame).toHaveAttribute("aria-busy", "true");
    expect(frame.className).not.toMatch(/opacity/);
    expect(frame.querySelector(".animate-cui-progress")).toHaveClass("motion-reduce:animate-none");
  });
});

describe("DataTable sorting", () => {
  it("makes sortable headers buttons, announces the primary sort, and reports shift-clicks", async () => {
    const toggleSort = vi.fn();
    renderTable({ sort: { key: "started", dir: "desc" }, toggleSort });
    expect(screen.getByRole("columnheader", { name: /Started/ })).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    expect(screen.getByRole("columnheader", { name: /Agent/ })).not.toHaveAttribute("aria-sort");
    expect(
      within(screen.getByRole("columnheader", { name: "Run" })).queryByRole("button")
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Agent" }));
    expect(toggleSort).toHaveBeenLastCalledWith("agent", false);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }), { shiftKey: true });
    expect(toggleSort).toHaveBeenLastCalledWith("agent", true);
  });

  it("numbers the keys of a multi-key sort for sight and for screen readers", () => {
    renderTable({
      sort: [
        { key: "agent", dir: "asc" },
        { key: "started", dir: "desc" },
      ],
    });
    expect(screen.getByRole("button", { name: "Agent, sort key 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Started, sort key 2" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Agent/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
  });

  it("draws plain headers when the query cannot sort", () => {
    renderTable({ sortEnabled: false });
    expect(screen.queryByRole("button", { name: "Agent" })).not.toBeInTheDocument();
  });
});

describe("DataTable rows", () => {
  it("links a row through its first cell, so it opens in a new tab like any link", () => {
    renderTable({}, { rowHref: (r) => `/tasks/${r.id}` });
    const link = within(bodyRows()[0]!).getByRole("link", { name: RUNS[0]!.id });
    expect(link).toHaveAttribute("href", `/tasks/${RUNS[0]!.id}`);
    expect(bodyRows()[0]).toHaveClass("relative");
  });

  it("makes a row that acts in place a named button", async () => {
    const onRowActivate = vi.fn();
    renderTable({}, { onRowActivate, rowLabel: (r) => `Open run ${r.id}` } as Partial<
      DataTableProps<RunRow>
    >);
    await userEvent.click(screen.getByRole("button", { name: `Open run ${RUNS[1]!.id}` }));
    expect(onRowActivate).toHaveBeenCalledWith(RUNS[1]);
  });

  it("puts each row's menu above the row link, named after the row", async () => {
    renderTable(
      {},
      {
        rowHref: (r) => `/tasks/${r.id}`,
        rowLabel: (r) => `run ${r.id}`,
        rowActions: (r) => <DropdownMenuItem>Cancel {r.id}</DropdownMenuItem>,
      }
    );
    const trigger = screen.getByRole("button", { name: `Actions for run ${RUNS[0]!.id}` });
    expect(trigger.closest("td")).toHaveClass("relative", "z-10");
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(
      await screen.findByRole("menuitem", { name: `Cancel ${RUNS[0]!.id}` })
    ).toBeInTheDocument();
  });
});

describe("DataTable selection", () => {
  function Selectable() {
    const selection = useRowSelection();
    return (
      <DataTable
        label="Runs"
        controller={fixtureController<RunRow>({ rows: RUNS })}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        empty={EMPTY}
        selection={selection}
        rowLabel={(r) => `run ${r.id}`}
        bulkActions={(s) => <button type="button">Retry {s.selectedCount}</button>}
      />
    );
  }

  it("selects rows and the page, shows the bulk bar, and clears", async () => {
    render(<Selectable />);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: `Select run ${RUNS[0]!.id}` }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select all runs on this page" })).toHaveAttribute(
      "aria-checked",
      "mixed"
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all runs on this page" }));
    expect(screen.getByRole("button", { name: `Retry ${RUNS.length}` })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });
});

describe("DataTable chrome", () => {
  it("searches through the controller and clears", async () => {
    const setSearch = vi.fn();
    renderTable({ search: "sup", setSearch }, { searchPlaceholder: "Search runs" });
    const box = screen.getByRole("searchbox", { name: "Search runs" });
    fireEvent.change(box, { target: { value: "support" } });
    expect(setSearch).toHaveBeenLastCalledWith("support");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(setSearch).toHaveBeenLastCalledWith("");
  });

  it("shows no search box when the query takes no search argument", () => {
    renderTable({ searchEnabled: false });
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("pages previous and next only, and changes the page size", async () => {
    const next = vi.fn();
    const setPageSize = vi.fn();
    renderTable({
      hasNext: true,
      hasPrev: false,
      pageIndex: 0,
      next,
      setPageSize,
      totalCount: 140,
    });
    expect(screen.getByText("140 results")).toBeInTheDocument();
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(next).toHaveBeenCalled();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "50");
    expect(setPageSize).toHaveBeenCalledWith(50);
  });

  it("draws no pagination on a single page, and the table alone with chrome=table", () => {
    renderTable({ hasNext: false, hasPrev: false }, { chrome: "table" });
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});

describe("DataTable density", () => {
  it("draws boxed cards in cards density when it has a card renderer", () => {
    renderTable(
      {},
      {
        density: "cards",
        rowHref: (r) => `/tasks/${r.id}`,
        renderCard: (r) => <span>card {r.id}</span>,
      }
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const cards = within(screen.getByRole("list", { name: "Runs" })).getAllByRole("listitem");
    expect(cards).toHaveLength(RUNS.length);
    expect(within(cards[0]!).getByRole("link")).toHaveAttribute("href", `/tasks/${RUNS[0]!.id}`);
  });

  it("keeps the table in cards density without a card renderer", () => {
    renderTable({}, { density: "cards" });
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("table").closest("[data-density]")).toHaveAttribute(
      "data-density",
      "cards"
    );
  });
});
