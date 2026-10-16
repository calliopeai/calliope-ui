import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRowSelection } from "./use-row-selection.js";

describe("useRowSelection", () => {
  it("keeps the selection across pages, so the count means what it says", () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.togglePage(["a", "b"]));
    // Page two: the header box answers for this page only.
    expect(result.current.pageSelectionState(["c", "d"])).toBe(false);
    act(() => result.current.toggle("c"));
    expect(result.current.pageSelectionState(["c", "d"])).toBe("indeterminate");
    expect(result.current.selectedCount).toBe(3);
    expect([...result.current.selectedIds].sort()).toEqual(["a", "b", "c"]);
  });

  it("clears the page when it is all on, and selects it otherwise", () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.toggle("a"));
    act(() => result.current.togglePage(["a", "b"]));
    expect(result.current.pageSelectionState(["a", "b"])).toBe(true);
    act(() => result.current.togglePage(["a", "b"]));
    expect(result.current.selectedCount).toBe(0);
  });

  it("answers false for an empty page, and clears", () => {
    const { result } = renderHook(() => useRowSelection());
    expect(result.current.pageSelectionState([])).toBe(false);
    act(() => result.current.toggle("x"));
    act(() => result.current.clear());
    expect(result.current.isSelected("x")).toBe(false);
  });
});
