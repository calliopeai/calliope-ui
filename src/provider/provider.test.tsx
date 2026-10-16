import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { defaultMessages, mergeMessages } from "./messages.js";
import { type LinkProps, UIProvider, useUI } from "./UIProvider.js";

describe("mergeMessages", () => {
  it("overrides one level deep and keeps the rest of each group", () => {
    const merged = mergeMessages({ table: { retry: "Reintentar" } });
    expect(merged.table.retry).toBe("Reintentar");
    expect(merged.table.clearSearch).toBe(defaultMessages.table.clearSearch);
    expect(merged.shell).toBe(defaultMessages.shell);
  });

  it("returns the defaults untouched without overrides", () => {
    expect(mergeMessages(undefined)).toBe(defaultMessages);
  });

  it("formats English defaults that take values", () => {
    expect(defaultMessages.table.results(1)).toBe("1 result");
    expect(defaultMessages.table.results(1400)).toBe("1,400 results");
    expect(defaultMessages.table.loadFailed("Runs")).toBe("Could not load runs");
    expect(defaultMessages.rail.resize("Assistant")).toBe("Resize assistant");
  });
});

describe("UIProvider", () => {
  it("gives a plain anchor and English copy without a provider", () => {
    const { result } = renderHook(() => useUI());
    expect(result.current.messages).toBe(defaultMessages);
    render(<result.current.Link href="/apps">Apps</result.current.Link>);
    expect(screen.getByRole("link", { name: "Apps" })).toHaveAttribute("href", "/apps");
  });

  it("hands every component the app's link and copy", () => {
    const seen = vi.fn();
    function RouterLink({ ref, href, children, ...props }: LinkProps) {
      seen(href);
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      );
    }
    const { result } = renderHook(() => useUI(), {
      wrapper: ({ children }) => (
        <UIProvider link={RouterLink} messages={{ nav: { label: "Principal" } }}>
          {children}
        </UIProvider>
      ),
    });
    expect(result.current.Link).toBe(RouterLink);
    expect(result.current.messages.nav.label).toBe("Principal");
  });
});
