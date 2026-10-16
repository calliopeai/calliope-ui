import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRailState, useRailWidth } from "./rail-state.js";

describe("useRailState", () => {
  it("uses the default until the person chooses, then remembers the choice", () => {
    const { result } = renderHook(() => useRailState("app.shell.projects", () => true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    expect(window.localStorage.getItem("app.shell.projects")).toBe("0");
  });

  it("keeps two hooks on the same key in step", () => {
    const first = renderHook(() => useRailState("app.shell.main"));
    const second = renderHook(() => useRailState("app.shell.main"));
    act(() => first.result.current[1](true));
    expect(second.result.current[0]).toBe(true);
  });
});

describe("useRailWidth", () => {
  const range = { min: 320, max: 560 };

  it("starts at the default and remembers a width, held to the range", () => {
    const { result } = renderHook(() => useRailWidth("app.dock.width", 400, range));
    expect(result.current[0]).toBe(400);
    act(() => result.current[1](480.6));
    expect(result.current[0]).toBe(481);
    act(() => result.current[1](9000));
    expect(result.current[0]).toBe(560);
  });

  it("ignores a stored width it cannot use", () => {
    window.localStorage.setItem("app.dock.width", "wide");
    expect(renderHook(() => useRailWidth("app.dock.width", 400, range)).result.current[0]).toBe(
      400
    );
    window.localStorage.setItem("app.dock.width", "100");
    expect(renderHook(() => useRailWidth("app.dock.width", 400, range)).result.current[0]).toBe(
      400
    );
  });
});
