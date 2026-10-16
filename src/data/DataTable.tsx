"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SearchXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";

import { useDensity } from "../appearance/AppearanceProvider.js";
import { cn } from "../lib/cn.js";
import { Button } from "../primitives/Button.js";
import { Checkbox } from "../primitives/Checkbox.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu.js";
import { Input } from "../primitives/Input.js";
import { Skeleton } from "../primitives/Skeleton.js";
import { useUI } from "../provider/UIProvider.js";
import { EmptyState } from "../states/EmptyState.js";
import type { Density } from "../theme/tokens.js";
import {
  type Column,
  type EmptyStateSpec,
  PAGE_SIZES,
  type SortState,
  type TableController,
} from "./types.js";
import type { RowSelection } from "./use-row-selection.js";

type RowActivation<TRow> =
  | {
      /** Rows that navigate are real links: middle-click, open in a new tab and copy link all work. */
      rowHref: (row: TRow) => string;
      onRowActivate?: never;
      /** Names a row for its checkbox and its menu ("run 7f3c2a91"). Defaults to the row id. */
      rowLabel?: (row: TRow) => string;
    }
  | {
      /** Rows that act in place are buttons, never fake links. */
      onRowActivate: (row: TRow) => void;
      /**
       * The activator's accessible name, and the name of the row's checkbox
       * and menu. Identify the row ("run 7f3c2a91"); the role supplies the verb.
       */
      rowLabel: (row: TRow) => string;
      rowHref?: never;
    }
  | { rowHref?: never; onRowActivate?: never; rowLabel?: (row: TRow) => string };

interface DataTableBaseProps<TRow> {
  /** Names the table for screen readers and in the state copy ("Could not load runs"). */
  label: string;
  controller: TableController<TRow>;
  columns: readonly Column<TRow>[];
  getRowId: (row: TRow) => string;
  /** The list is genuinely empty. Required: a table never renders nothing. */
  empty: EmptyStateSpec;
  /** The search or filters excluded everything. Defaults to a clear-search prompt. */
  emptyFiltered?: Pick<EmptyStateSpec, "title" | "description">;
  /** Turns on the row and page checkboxes. */
  selection?: RowSelection;
  /** Shown in a bar above the table while rows are selected. */
  bulkActions?: (selection: RowSelection) => React.ReactNode;
  /** Items for each row's `⋯` menu (`DropdownMenuItem`s). */
  rowActions?: (row: TRow) => React.ReactNode;
  searchPlaceholder?: string;
  /** Filters and actions beside the search box. */
  toolbar?: React.ReactNode;
  rowClassName?: (row: TRow) => string | undefined;
  /**
   * The card for a row, drawn when the density is `cards`: the content only;
   * the table draws the box. Without it, cards density keeps the table with
   * roomier rows. Cards carry no checkboxes and no row menu.
   */
  renderCard?: (row: TRow) => React.ReactNode;
  /** Overrides the person's density for this table. */
  density?: Density;
  /** `table` draws the table alone, for a page that draws its own filter bar and paging. */
  chrome?: "full" | "table";
  className?: string;
}

export type DataTableProps<TRow> = DataTableBaseProps<TRow> & RowActivation<TRow>;

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;

const CELL = "px-(--row-pad-x) py-(--row-pad-y) align-middle whitespace-nowrap";

function sortKeys(sort: SortState | readonly SortState[] | undefined): readonly SortState[] {
  if (!sort) return [];
  return Array.isArray(sort) ? (sort as readonly SortState[]) : [sort as SortState];
}

/**
 * The house list surface (Astrolift #1231), with its guarantees in the
 * types: `label` and `empty` are required, `empty` and `emptyFiltered` are
 * different states, rows are links or buttons and never both, loading draws
 * skeleton rows inside the real table, and sorting is the server's. Density
 * is real: compact rows, or boxed cards when the table has a card renderer.
 */
export function DataTable<TRow>({
  label,
  controller,
  columns,
  getRowId,
  empty,
  emptyFiltered,
  selection,
  bulkActions,
  rowActions,
  searchPlaceholder,
  toolbar,
  rowClassName,
  renderCard,
  density: densityProp,
  chrome = "full",
  className,
  rowHref,
  onRowActivate,
  rowLabel,
}: DataTableProps<TRow>) {
  const { Link, messages } = useUI();
  const t = messages.table;
  const contextDensity = useDensity();
  const density = densityProp ?? contextDensity;
  const { rows, state, error, retry, pageSize, clearFilters } = controller;
  const cards = density === "cards" && Boolean(renderCard);

  const pageIds = React.useMemo(() => rows.map(getRowId), [rows, getRowId]);
  const visibleColumns: Column<TRow>[] = rowActions
    ? [
        ...columns,
        {
          id: "__actions",
          header: <span className="sr-only">{t.actions}</span>,
          width: "w-10",
          align: "right",
          // Above the row's stretched link, so the menu opens instead of the row.
          cellClassName: "relative z-10",
          cell: (row) => (
            <RowMenu label={t.rowActions(rowLabel?.(row) ?? getRowId(row))}>
              {rowActions(row)}
            </RowMenu>
          ),
        },
      ]
    : [...columns];
  const columnCount = visibleColumns.length + (selection ? 1 : 0);
  const firstColumnId = visibleColumns[0]?.id;
  const sorts = sortKeys(controller.sort);

  const message = (
    icon: React.ReactNode,
    title: string,
    body: string,
    action: React.ReactNode,
    alert = false
  ) => (
    <div
      role={alert ? "alert" : undefined}
      className="flex flex-col items-center gap-3 px-6 text-center"
    >
      {icon}
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-md text-sm [overflow-wrap:anywhere] text-muted-foreground">
          {body}
        </p>
      </div>
      {action}
    </div>
  );
  const errorMessage = message(
    <TriangleAlertIcon className="size-5 text-danger" aria-hidden />,
    t.loadFailed(label),
    error?.message || t.requestFailed,
    <Button size="sm" variant="outline" onClick={retry}>
      {t.retry}
    </Button>,
    true
  );
  const filteredMessage = message(
    <SearchXIcon className="size-5 text-muted-foreground" aria-hidden />,
    emptyFiltered?.title ?? t.noMatches,
    emptyFiltered?.description ?? t.noMatchesDescription(label),
    <Button size="sm" variant="outline" onClick={clearFilters}>
      {t.clearSearch}
    </Button>
  );

  // A message spanning the row stays in view when a wide table scrolls
  // sideways: it is as wide as the scroll container (100cqw), pinned left.
  const fullRow = (content: React.ReactNode, padded = true) => (
    <tr>
      <td colSpan={columnCount} className="p-0">
        <div className={cn("sticky left-0 w-[100cqw] max-w-full", padded && "py-10")}>
          {content}
        </div>
      </td>
    </tr>
  );

  const tableBody = (() => {
    switch (state) {
      case "loading":
        // Skeleton rows inside the real table, sized from the columns, so the
        // first paint has the geometry the rows will have.
        return Array.from({ length: Math.min(pageSize, 8) }, (_, i) => (
          <tr key={`skeleton-${i}`} className="border-b last:border-0">
            {selection && (
              <td className={cn(CELL, "w-10")}>
                <Skeleton className="size-4" />
              </td>
            )}
            {visibleColumns.map((column) => (
              <td key={column.id} className={cn(CELL, column.width)}>
                <Skeleton className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ));
      case "error":
        return fullRow(errorMessage);
      case "emptyFiltered":
        return fullRow(filteredMessage);
      case "empty":
        return fullRow(<EmptyState {...empty} className="rounded-none border-0" />, false);
      case "ready":
        return rows.map((row) => {
          const id = getRowId(row);
          const selected = selection?.isSelected(id) ?? false;
          return (
            <tr
              key={id}
              data-state={selected ? "selected" : undefined}
              // `relative`: the activator is stretched with `after:inset-0`,
              // which reaches the nearest positioned ancestor; without it the
              // last row's overlay would swallow every click (Astrolift #1502).
              className={cn(
                "border-b transition-colors last:border-0 hover:bg-muted/50 data-[state=selected]:bg-muted",
                (rowHref || onRowActivate) && "relative cursor-pointer",
                rowClassName?.(row)
              )}
            >
              {selection && (
                // relative z-10: above the stretched link, so the box selects instead of opening.
                <td className={cn(CELL, "relative z-10 w-10")}>
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => selection.toggle(id)}
                    aria-label={t.selectRow(rowLabel?.(row) ?? id)}
                  />
                </td>
              )}
              {visibleColumns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    CELL,
                    column.width,
                    column.align && ALIGN[column.align],
                    column.cellClassName
                  )}
                >
                  {column.id === firstColumnId && rowHref ? (
                    <Link
                      href={rowHref(row)}
                      className="outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                    >
                      {column.cell(row)}
                    </Link>
                  ) : column.id === firstColumnId && onRowActivate ? (
                    <button
                      type="button"
                      aria-label={rowLabel?.(row)}
                      onClick={() => onRowActivate(row)}
                      className="text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                    >
                      {column.cell(row)}
                    </button>
                  ) : (
                    column.cell(row)
                  )}
                </td>
              ))}
            </tr>
          );
        });
    }
  })();

  const table = (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-opacity",
        controller.isStale && "opacity-60"
      )}
      aria-busy={state === "loading" || controller.isStale || undefined}
    >
      <div className="[container-type:inline-size] relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr className="border-b">
              {selection && (
                <th scope="col" className="h-10 w-10 px-(--row-pad-x) align-middle">
                  <Checkbox
                    checked={selection.pageSelectionState(pageIds)}
                    onCheckedChange={() => selection.togglePage(pageIds)}
                    aria-label={t.selectPage(label)}
                    disabled={pageIds.length === 0}
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={ariaSort(column.sortKey, sorts)}
                  className={cn(
                    "h-10 px-(--row-pad-x) text-left align-middle text-2xs font-semibold tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase",
                    column.width,
                    column.align && ALIGN[column.align],
                    column.headClassName
                  )}
                >
                  {column.sortKey && controller.sortEnabled ? (
                    <SortHeader
                      sortKey={column.sortKey}
                      sorts={sorts}
                      onToggle={controller.toggleSort}
                    >
                      {column.header}
                    </SortHeader>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </table>
      </div>
    </div>
  );

  const cardGrid = (() => {
    const grid = "grid min-w-0 grid-cols-(--list-columns) gap-(--list-gap) transition-opacity";
    const box =
      "relative min-w-0 rounded-(--list-item-radius) border-(length:--list-item-border) bg-(--list-item-bg) [padding:var(--list-item-pad)]";
    switch (state) {
      case "loading":
        return (
          <div className={grid} aria-busy>
            {Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        );
      case "error":
        return <div className="rounded-lg border py-10">{errorMessage}</div>;
      case "emptyFiltered":
        return <div className="rounded-lg border py-10">{filteredMessage}</div>;
      case "empty":
        return <EmptyState {...empty} />;
      case "ready":
        return (
          <ul aria-label={label} className={cn(grid, controller.isStale && "opacity-60")}>
            {rows.map((row) => (
              <li key={getRowId(row)} className={cn(box, rowClassName?.(row))}>
                {rowHref ? (
                  <Link
                    href={rowHref(row)}
                    className="block h-full rounded-lg outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring"
                  >
                    {renderCard?.(row)}
                  </Link>
                ) : onRowActivate ? (
                  <button
                    type="button"
                    aria-label={rowLabel?.(row)}
                    onClick={() => onRowActivate(row)}
                    className="block h-full w-full text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring"
                  >
                    {renderCard?.(row)}
                  </button>
                ) : (
                  renderCard?.(row)
                )}
              </li>
            ))}
          </ul>
        );
    }
  })();

  return (
    <div
      data-slot="data-table"
      data-density={densityProp}
      className={cn("flex min-w-0 flex-col gap-3", className)}
    >
      {chrome === "full" && (
        <Toolbar controller={controller} placeholder={searchPlaceholder}>
          {toolbar}
        </Toolbar>
      )}

      {selection && selection.selectedCount > 0 && bulkActions && !cards && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium tabular-nums">
            {t.selected(selection.selectedCount)}
          </span>
          <Button variant="ghost" size="sm" onClick={selection.clear}>
            {t.clearSelection}
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-2">{bulkActions(selection)}</div>
        </div>
      )}

      {cards ? cardGrid : table}

      {chrome === "full" && <Pagination controller={controller} />}

      {state === "loading" && (
        <p role="status" className="sr-only">
          {t.loading}
        </p>
      )}
    </div>
  );
}

function ariaSort(
  sortKey: string | undefined,
  sorts: readonly SortState[]
): "ascending" | "descending" | undefined {
  const primary = sorts[0];
  if (!sortKey || primary?.key !== sortKey) return undefined;
  return primary.dir === "asc" ? "ascending" : "descending";
}

function SortHeader({
  sortKey,
  sorts,
  onToggle,
  children,
}: {
  sortKey: string;
  sorts: readonly SortState[];
  onToggle: (key: string, additive: boolean) => void;
  children: React.ReactNode;
}) {
  const { messages } = useUI();
  const index = sorts.findIndex((s) => s.key === sortKey);
  const dir = index === -1 ? undefined : sorts[index]?.dir;
  return (
    <button
      type="button"
      onClick={(event) => onToggle(sortKey, event.shiftKey)}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        dir ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
      {dir === "asc" ? (
        <ArrowUpIcon className="size-3.5" aria-hidden />
      ) : dir === "desc" ? (
        <ArrowDownIcon className="size-3.5" aria-hidden />
      ) : (
        <ChevronsUpDownIcon className="size-3.5 opacity-40" aria-hidden />
      )}
      {index !== -1 && sorts.length > 1 && (
        <span className="font-mono text-2xs tabular-nums">
          {index + 1}
          <span className="sr-only">, {messages.table.sortKey(index + 1)}</span>
        </span>
      )}
    </button>
  );
}

function Toolbar<TRow>({
  controller,
  placeholder,
  children,
}: {
  controller: TableController<TRow>;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const { messages } = useUI();
  const t = messages.table;
  const { search, setSearch, searchEnabled, totalCount } = controller;
  if (!searchEnabled && !children && totalCount === null) return null;
  const searchLabel = placeholder ?? t.search;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchEnabled && (
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="pr-8 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearch("")}
              aria-label={t.clearSearch}
              className="absolute top-1/2 right-1 -translate-y-1/2"
            >
              <XIcon aria-hidden />
            </Button>
          )}
        </div>
      )}
      {children}
      {totalCount !== null && (
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">
          {t.results(totalCount)}
        </span>
      )}
    </div>
  );
}

/**
 * Previous and next, never a page number to jump to: a keyset walk has no
 * "page 7", so the control cannot be rendered honestly.
 */
function Pagination<TRow>({ controller }: { controller: TableController<TRow> }) {
  const { messages } = useUI();
  const t = messages.table;
  const selectId = React.useId();
  const { pageIndex, hasNext, hasPrev, next, prev, pageSize, setPageSize } = controller;
  const sizes = controller.pageSizes ?? PAGE_SIZES;
  if (!hasNext && !hasPrev) return null;
  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor={selectId} className="text-sm text-muted-foreground">
          {t.rowsPerPage}
        </label>
        <select
          id={selectId}
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          className="h-7 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground tabular-nums">{t.page(pageIndex + 1)}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          disabled={!hasPrev}
          aria-label={t.previousPage}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={next}
          disabled={!hasNext}
          aria-label={t.nextPage}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function RowMenu({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label}>
          <MoreHorizontalIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
