import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppearancePicker } from "./AppearancePicker.js";
import { AppearanceProvider } from "./AppearanceProvider.js";
import type { OrgAppearancePolicy } from "./appearance.js";
import { astroliftBrand, zentinelleBrand } from "./brands.js";
import { type Product, defineProduct } from "./product.js";

const astrolift = defineProduct(astroliftBrand);
const zentinelle = defineProduct(zentinelleBrand);
const root = document.documentElement;

function renderPicker(product: Product = astrolift, policy?: OrgAppearancePolicy) {
  return render(
    <AppearanceProvider product={product} policy={policy}>
      <AppearancePicker />
    </AppearanceProvider>
  );
}

function stored(product: Product = astrolift) {
  return JSON.parse(window.localStorage.getItem(product.storageKey) ?? "null");
}

function group(name: string) {
  return within(screen.getByRole("group", { name }));
}

describe("AppearancePicker", () => {
  it("chooses a ground, which also chooses light or dark", async () => {
    renderPicker();
    await userEvent.click(group("Ground").getByRole("radio", { name: /Paper/ }));
    expect(stored()).toEqual({ ground: "paper" });
    expect(root.dataset.mode).toBe("light");
    expect(group("Ground").getByRole("radio", { name: /Paper/ })).toBeChecked();
  });

  it("chooses a named theme: its ground and accent together", async () => {
    renderPicker();
    await userEvent.click(group("Theme").getByRole("radio", { name: /Forge/ }));
    expect(stored()).toEqual({ ground: "black", accent: "copper" });
    expect(group("Accent").getByRole("radio", { name: /Copper/ })).toBeChecked();
  });

  it("chooses density and corners", async () => {
    renderPicker();
    await userEvent.click(group("Density").getByRole("radio", { name: /Cards/ }));
    await userEvent.click(group("Corners").getByRole("radio", { name: "Square" }));
    expect(stored()).toEqual({ density: "cards", corners: 0 });
    expect(root.dataset.density).toBe("cards");
    expect(root.style.getPropertyValue("--radius")).toBe("0px");
  });

  it("applies a custom accent only once it stands 3:1 off the ground", async () => {
    window.localStorage.setItem(astrolift.storageKey, JSON.stringify({ ground: "black" }));
    renderPicker();
    const field = screen.getByLabelText("Custom accent");
    fireEvent.change(field, { target: { value: "#101010" } });
    expect(screen.getByText(/needs 3:1/)).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(stored()).toEqual({ ground: "black" });
    fireEvent.change(field, { target: { value: "#D94F8A" } });
    expect(stored()).toEqual({ ground: "black", accent: "#d94f8a" });
    expect(root.dataset.accent).toBe("custom");
    expect(screen.getByText("In use")).toBeInTheDocument();
  });

  it("explains a value that is not a colour", () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText("Custom accent"), { target: { value: "teal-ish" } });
    expect(screen.getByText(/Use a hex colour/)).toBeInTheDocument();
  });

  it("resets to no preference", async () => {
    window.localStorage.setItem(astrolift.storageKey, JSON.stringify({ ground: "paper" }));
    renderPicker();
    await userEvent.click(screen.getByRole("button", { name: "Use the default" }));
    expect(stored()).toBeNull();
  });

  it("is read-only while the org has locked the theme, and says so", () => {
    renderPicker(astrolift, { locked: true });
    expect(screen.getByText(/locked the theme/)).toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Use the default" })).not.toBeInTheDocument();
  });

  it("offers Zentinelle its own accent first and no emerald ground", () => {
    renderPicker(zentinelle);
    const accents = group("Accent").getAllByRole("radio");
    expect(accents[0]).toHaveAccessibleName("Teal");
    expect(accents[0]).toBeChecked();
    expect(group("Ground").queryByRole("radio", { name: /Emerald/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Theme" })).not.toBeInTheDocument();
  });
});
