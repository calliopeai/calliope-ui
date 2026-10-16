import type * as React from "react";

/**
 * What a table is showing. A union rather than a bag of booleans, so the
 * render is a total switch: every "renders nothing" bug Astrolift's audit
 * found was a missing branch.
 */
export type PageState =
  | "loading"
  | "error"
  /** No rows and no filter narrowing them: the list is genuinely empty. */
  | "empty"
  /** No rows because the search or filters excluded them all. */
  | "emptyFiltered"
  | "ready";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  dir: SortDirection;
}

export interface Column<TRow> {
  /** Stable identity; also the React key. */
  id: string;
  header: React.ReactNode;
  /** Plain-text name where a node will not do. Defaults to `header` when that is a string. */
  label?: string;
  cell: (row: TRow) => React.ReactNode;
  /** A Tailwind width class (`w-32`); it also sizes the column's loading skeleton. */
  width?: string;
  align?: "left" | "right" | "center";
  headClassName?: string;
  cellClassName?: string;
  /**
   * The server's sort key. Present, the header is a sort control; absent, a
   * plain header. There is no client sort: reordering one page while the rest
   * of the result set sits on the server is wrong at every page boundary.
   */
  sortKey?: string;
}

/** Copy for a genuinely empty list: what is missing, and how to change that. */
export interface EmptyStateSpec {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  learnMoreHref?: string;
  learnMoreLabel?: string;
}

/**
 * The data side of a DataTable: rows, state, paging, search and sort, with
 * the server doing the work. The package fetches nothing, so each app
 * implements this over its own data layer; Astrolift's `useCursorTable`
 * (Apollo, keyset cursors, debounced server search) already satisfies it.
 * Rules the type cannot hold: paging is server-side; the search box shows only
 * when the query takes a search argument (`searchEnabled`); search is
 * debounced by the controller, never per keystroke; rows from the previous
 * question stay on screen, faded (`isStale`), until the next answer lands.
 */
export interface TableController<TRow> {
  rows: readonly TRow[];
  state: PageState;
  error?: { message: string } | null;
  retry: () => void;
  /** The exact count when the server knows it cheaply; null otherwise. */
  totalCount: number | null;
  /** 0-based index of the page on screen. */
  pageIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  next: () => void;
  prev: () => void;
  pageSize: number;
  /** The page sizes offered. Defaults to 10, 25, 50 and 100. */
  pageSizes?: readonly number[];
  setPageSize: (size: number) => void;
  /** The live input value: it updates on every keystroke; the query does not. */
  search: string;
  setSearch: (search: string) => void;
  searchEnabled: boolean;
  /** The rows on screen answer a previous question (a search still debouncing, a page in flight). */
  isStale: boolean;
  /** One key, or the ordered keys of a multi-key sort. */
  sort: SortState | readonly SortState[] | undefined;
  /** `additive` is true on shift-click: add the column as the next key. */
  toggleSort: (key: string, additive: boolean) => void;
  sortEnabled: boolean;
  /** True when a search or filter is narrowing the result set. */
  isFiltered: boolean;
  clearFilters: () => void;
}

export const PAGE_SIZES: readonly number[] = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;
