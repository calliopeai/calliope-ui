import { afterEach, describe, expect, it, vi } from "vitest";

import { cn } from "./cn.js";
import { LOCAL_STORE_EVENT, readLocal, subscribeLocal, writeLocal } from "./local-store.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cn", () => {
  it("lets a later utility override an earlier one, including the package's own scale", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
    expect(cn("text-2xs text-muted-foreground", "text-xs")).toBe("text-muted-foreground text-xs");
    expect(cn("rounded-lg", null, undefined, { hidden: false }, "rounded-full")).toBe(
      "rounded-full"
    );
  });
});

describe("local store", () => {
  it("reads what it wrote and tells subscribers", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeLocal(onChange);
    writeLocal("k", "v");
    expect(readLocal("k")).toBe("v");
    writeLocal("k", null);
    expect(readLocal("k")).toBeNull();
    unsubscribe();
    writeLocal("k", "again");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("hears another tab through the storage event", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeLocal(onChange);
    window.dispatchEvent(new StorageEvent("storage", { key: "k" }));
    unsubscribe();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps a refused write for the page, and drops it once storage works again", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    const heard = vi.fn();
    window.addEventListener(LOCAL_STORE_EVENT, heard);
    writeLocal("k", "held");
    window.removeEventListener(LOCAL_STORE_EVENT, heard);
    expect(readLocal("k")).toBe("held");
    expect(window.localStorage.getItem("k")).toBeNull();
    expect(heard).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
    writeLocal("k", "saved");
    expect(window.localStorage.getItem("k")).toBe("saved");
    writeLocal("k", null);
  });

  it("reads null rather than throwing when storage itself throws", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(readLocal("anything")).toBeNull();
  });
});
