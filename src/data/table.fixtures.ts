/**
 * Story and test fixtures for tables and lists: a controller in any state,
 * typed against TableController so a story cannot drift from the contract,
 * and sample rows. Not part of the published package.
 */
import type { StatusTone } from "../status/tones.js";
import type { TableController } from "./types.js";

const noop = () => {};

export function fixtureController<TRow>(
  overrides: Partial<TableController<TRow>> = {}
): TableController<TRow> {
  return {
    rows: [],
    state: "ready",
    error: null,
    retry: noop,
    totalCount: null,
    pageIndex: 0,
    hasNext: false,
    hasPrev: false,
    next: noop,
    prev: noop,
    pageSize: 25,
    setPageSize: noop,
    search: "",
    setSearch: noop,
    searchEnabled: true,
    isStale: false,
    sort: { key: "started", dir: "desc" },
    toggleSort: noop,
    sortEnabled: true,
    isFiltered: false,
    clearFilters: noop,
    ...overrides,
  };
}

export interface RunRow {
  id: string;
  agent: string;
  status: "running" | "succeeded" | "failed" | "queued";
  took: string;
  trigger: string;
  started: string;
}

export const RUN_TONE: Record<RunRow["status"], StatusTone> = {
  running: "info",
  succeeded: "ok",
  failed: "error",
  queued: "muted",
};

export const RUNS: RunRow[] = [
  {
    id: "7f3c2a91",
    agent: "support-bot",
    status: "running",
    took: "0:42",
    trigger: "webhook",
    started: "2m ago",
  },
  {
    id: "7e11b0c4",
    agent: "support-bot",
    status: "failed",
    took: "1:10",
    trigger: "webhook",
    started: "9m ago",
  },
  {
    id: "7d02e5f7",
    agent: "nightly-sync",
    status: "succeeded",
    took: "4:10",
    trigger: "schedule",
    started: "1h ago",
  },
  {
    id: "7c9a1d33",
    agent: "triage-agent",
    status: "succeeded",
    took: "0:18",
    trigger: "manual",
    started: "3h ago",
  },
  {
    id: "7b4410ee",
    agent: "billing-reconcile",
    status: "queued",
    took: "",
    trigger: "schedule",
    started: "in 4m",
  },
];
