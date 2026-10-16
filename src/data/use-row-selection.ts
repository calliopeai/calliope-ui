"use client";

import * as React from "react";

export interface RowSelection {
  selectedIds: readonly string[];
  selectedCount: number;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Select, or clear, every row on the current page. */
  togglePage: (ids: readonly string[]) => void;
  /** `true`, `false` or `"indeterminate"`, for the header box. */
  pageSelectionState: (ids: readonly string[]) => boolean | "indeterminate";
  clear: () => void;
}

/**
 * Row selection that survives paging (Astrolift #1231): the selected ids are
 * kept across pages, so the count in the bulk bar means what it says, while
 * the header box answers for the page on screen only.
 */
export function useRowSelection(): RowSelection {
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());

  const toggle = React.useCallback((id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const togglePage = React.useCallback((ids: readonly string[]) => {
    setSelected((previous) => {
      const next = new Set(previous);
      const allOn = ids.length > 0 && ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allOn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const pageSelectionState = React.useCallback(
    (ids: readonly string[]): boolean | "indeterminate" => {
      if (ids.length === 0) return false;
      const on = ids.filter((id) => selected.has(id)).length;
      if (on === 0) return false;
      return on === ids.length ? true : "indeterminate";
    },
    [selected]
  );

  const isSelected = React.useCallback((id: string) => selected.has(id), [selected]);
  const clear = React.useCallback(() => setSelected(new Set()), []);
  const selectedIds = React.useMemo(() => [...selected], [selected]);

  return {
    selectedIds,
    selectedCount: selected.size,
    isSelected,
    toggle,
    togglePage,
    pageSelectionState,
    clear,
  };
}
