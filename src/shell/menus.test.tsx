import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaletteIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { AppearanceProvider } from "../appearance/AppearanceProvider.js";
import { zentinelleBrand } from "../appearance/brands.js";
import { defineProduct } from "../appearance/product.js";
import { BrandMark } from "./BrandMark.js";
import { UserMenu } from "./UserMenu.js";

describe("UserMenu", () => {
  it("is named by the name and email it shows, with the initials beside them", () => {
    render(<UserMenu name="Leo Mata" email="leo@calliope.ai" onSignOut={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Leo Mata leo@calliope.ai" });
    expect(trigger).toHaveTextContent("LM");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("collapsed, shows only the initials and takes a label instead", () => {
    render(<UserMenu name="Leo Mata" email="leo@calliope.ai" onSignOut={() => {}} collapsed />);
    expect(
      screen.getByRole("button", { name: "LM, account menu for Leo Mata" })
    ).not.toHaveTextContent("leo@calliope.ai");
  });

  it("lists pages as links, actions as items, and signs out", async () => {
    const onSignOut = vi.fn();
    const onAppearance = vi.fn();
    render(
      <UserMenu
        name="Leo Mata"
        email="leo@calliope.ai"
        onSignOut={onSignOut}
        groups={[
          [{ label: "Profile", href: "/profile" }],
          [{ label: "Appearance", icon: PaletteIcon, onSelect: onAppearance }],
        ]}
      />
    );
    fireEvent.keyDown(screen.getByRole("button", { name: /Leo Mata/ }), { key: "Enter" });
    expect(await screen.findByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile"
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Appearance" }));
    expect(onAppearance).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("button", { name: /Leo Mata/ }), { key: "Enter" });
    await userEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

describe("BrandMark", () => {
  it("takes the product's name from the provider and links home", () => {
    render(
      <AppearanceProvider product={defineProduct(zentinelleBrand)} value={null}>
        <BrandMark href="/dashboard" />
      </AppearanceProvider>
    );
    expect(screen.getByRole("link", { name: "Zentinelle AI" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });

  it("collapsed, keeps the name for screen readers", () => {
    render(<BrandMark href="/" name="Astrolift AI" mark={<svg />} collapsed />);
    expect(screen.getByRole("link", { name: "Astrolift AI" })).not.toHaveTextContent(
      "Astrolift AI"
    );
  });

  it("refuses to render without a name", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<BrandMark href="/" />)).toThrow(/needs a name/);
    vi.restoreAllMocks();
  });
});
