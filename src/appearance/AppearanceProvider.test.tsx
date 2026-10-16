import { act, render, renderHook, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { appearanceScript } from "./boot.js";
import { astroliftBrand, zentinelleBrand } from "./brands.js";
import { AppearanceProvider, useAppearance, useDensity, useProduct } from "./AppearanceProvider.js";
import { defineProduct } from "./product.js";

const astrolift = defineProduct(astroliftBrand);
const zentinelle = defineProduct(zentinelleBrand);
const root = document.documentElement;

function Probe() {
  const { appearance, mode, locked, personal } = useAppearance();
  return (
    <output data-testid="probe">{JSON.stringify({ ...appearance, mode, locked, personal })}</output>
  );
}

function probe() {
  return JSON.parse(screen.getByTestId("probe").textContent ?? "{}");
}

function wrapper(props: Partial<React.ComponentProps<typeof AppearanceProvider>> = {}) {
  return ({ children }: { children: React.ReactNode }) => (
    <AppearanceProvider product={astrolift} {...props}>
      {children}
    </AppearanceProvider>
  );
}

/** A matchMedia that reports `mode` and can be switched, as the OS would. */
function mockSystem(initial: "dark" | "light") {
  let mode = initial;
  const listeners = new Set<() => void>();
  window.matchMedia = ((query: string) => ({
    get matches() {
      return mode === "light" && query.includes("light");
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  })) as unknown as typeof window.matchMedia;
  return (next: "dark" | "light") => {
    mode = next;
    for (const cb of listeners) cb();
  };
}

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe("AppearanceProvider", () => {
  it("reads the stored preference and stamps <html> with it", () => {
    window.localStorage.setItem(
      astrolift.storageKey,
      JSON.stringify({ ground: "paper", accent: "copper" })
    );
    render(<Probe />, { wrapper: wrapper() });
    expect(probe()).toMatchObject({
      ground: "paper",
      accent: "copper",
      mode: "light",
      personal: { ground: "paper", accent: "copper" },
    });
    expect(root.dataset).toMatchObject({
      product: "astrolift",
      ground: "paper",
      mode: "light",
      accent: "copper",
      density: "compact",
    });
  });

  it("writes a change to storage, reports it, and applies it", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAppearance(), { wrapper: wrapper({ onChange }) });
    act(() => result.current.setAppearance({ density: "cards" }));
    act(() => result.current.setAppearance({ corners: 10 }));
    // Two changes in one tick both land: the second reads the stored first.
    expect(JSON.parse(window.localStorage.getItem(astrolift.storageKey) ?? "{}")).toEqual({
      density: "cards",
      corners: 10,
    });
    expect(onChange).toHaveBeenLastCalledWith({ density: "cards", corners: 10 });
    expect(root.dataset.density).toBe("cards");
    expect(root.style.getPropertyValue("--radius")).toBe("10px");
  });

  it("resets to no preference at all, so the org default applies again", () => {
    const onChange = vi.fn();
    window.localStorage.setItem(astrolift.storageKey, JSON.stringify({ accent: "ice" }));
    const { result } = renderHook(() => useAppearance(), {
      wrapper: wrapper({ onChange, policy: { orgDefault: { accent: "copper" } } }),
    });
    expect(result.current.appearance.accent).toBe("ice");
    act(() => result.current.reset());
    expect(window.localStorage.getItem(astrolift.storageKey)).toBeNull();
    expect(onChange).toHaveBeenCalledWith(null);
    expect(result.current.appearance.accent).toBe("copper");
    expect(result.current.personal).toBeNull();
  });

  it("refuses changes while the org has locked the theme", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAppearance(), {
      wrapper: wrapper({ onChange, policy: { locked: true, orgDefault: { ground: "charcoal" } } }),
    });
    act(() => result.current.setAppearance({ ground: "paper" }));
    act(() => result.current.reset());
    expect(result.current.locked).toBe(true);
    expect(result.current.appearance.ground).toBe("charcoal");
    expect(window.localStorage.getItem(astrolift.storageKey)).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("takes an org policy supplied later, from inside the signed-in layout", () => {
    const { result } = renderHook(() => useAppearance(), { wrapper: wrapper() });
    act(() => result.current.setPolicy({ orgDefault: { ground: "black", accent: "amber" } }));
    expect(result.current.appearance).toMatchObject({ ground: "black", accent: "amber" });
  });

  it("takes the server's preference without echoing it back", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAppearance(), { wrapper: wrapper({ onChange }) });
    act(() => result.current.applyServerAppearance({ ground: "mist", accent: "ice", unknown: 1 }));
    expect(result.current.appearance).toMatchObject({ ground: "mist", accent: "ice" });
    act(() => result.current.applyServerAppearance({}));
    expect(result.current.personal).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("follows a change made in another tab", () => {
    render(<Probe />, { wrapper: wrapper() });
    act(() => {
      window.localStorage.setItem(astrolift.storageKey, JSON.stringify({ ground: "black" }));
      window.dispatchEvent(new StorageEvent("storage", { key: astrolift.storageKey }));
    });
    expect(probe().ground).toBe("black");
  });

  it("follows the operating system's light or dark until a ground is chosen", () => {
    const switchTo = mockSystem("dark");
    const { result } = renderHook(() => useAppearance(), { wrapper: wrapper() });
    expect(result.current.appearance.ground).toBe("graphite");
    act(() => switchTo("light"));
    expect(result.current.appearance.ground).toBe("mist");
    expect(root.dataset.mode).toBe("light");
    act(() => result.current.setAppearance({ ground: "black" }));
    act(() => switchTo("dark"));
    act(() => switchTo("light"));
    expect(result.current.appearance.ground).toBe("black");
  });

  it("controlled, ignores storage and only reports changes", () => {
    const onChange = vi.fn();
    window.localStorage.setItem(zentinelle.storageKey, JSON.stringify({ ground: "paper" }));
    const { result } = renderHook(() => useAppearance(), {
      wrapper: ({ children }) => (
        <AppearanceProvider product={zentinelle} value={{ ground: "charcoal" }} onChange={onChange}>
          {children}
        </AppearanceProvider>
      ),
    });
    expect(result.current.appearance).toMatchObject({ ground: "charcoal", accent: "teal" });
    act(() => result.current.setAppearance({ accent: "ice" }));
    expect(onChange).toHaveBeenCalledWith({ ground: "charcoal", accent: "ice" });
    expect(window.localStorage.getItem(zentinelle.storageKey)).toBe(
      JSON.stringify({ ground: "paper" })
    );
  });

  it("does not repaint the defaults while hydrating over the boot script (no flash)", async () => {
    window.localStorage.setItem(
      astrolift.storageKey,
      JSON.stringify({ ground: "paper", accent: "copper" })
    );
    new Function(appearanceScript(astrolift))();
    expect(root.dataset.ground).toBe("paper");

    const tree = (
      <AppearanceProvider product={astrolift}>
        <Probe />
      </AppearanceProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);

    const grounds: (string | null)[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) grounds.push(record.oldValue);
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-ground"],
      attributeOldValue: true,
    });
    await act(async () => {
      render(tree, { container, hydrate: true });
    });
    observer.disconnect();
    grounds.push(root.dataset.ground ?? null);

    // Every value <html> held during hydration: never the product default.
    expect(grounds).not.toContain("graphite");
    expect(root.dataset.ground).toBe("paper");
    expect(probe().ground).toBe("paper");
  });
});

describe("hooks outside a provider", () => {
  it("useAppearance throws, useProduct is null and useDensity is compact", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAppearance())).toThrow(/inside <AppearanceProvider>/);
    expect(renderHook(() => useProduct()).result.current).toBeNull();
    expect(renderHook(() => useDensity()).result.current).toBe("compact");
  });

  it("useProduct and useDensity read the provider", () => {
    window.localStorage.setItem(astrolift.storageKey, JSON.stringify({ density: "cards" }));
    expect(renderHook(() => useProduct(), { wrapper: wrapper() }).result.current?.id).toBe(
      "astrolift"
    );
    expect(renderHook(() => useDensity(), { wrapper: wrapper() }).result.current).toBe("cards");
  });
});
