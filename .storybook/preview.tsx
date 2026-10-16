import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource-variable/dm-sans/index.css";
import "./storybook.css";

import type { Decorator, Preview } from "@storybook/react-vite";
import * as React from "react";

import type { Appearance } from "../src/appearance/appearance.js";
import { AppearanceProvider } from "../src/appearance/AppearanceProvider.js";
import { productStyles } from "../src/appearance/boot.js";
import { CORNERS } from "../src/appearance/product.js";
import { PRODUCTS, astrolift } from "../src/examples/products.js";
import { type LinkProps, UIProvider } from "../src/provider/UIProvider.js";
import { ACCENT_KEYS, DENSITY_KEYS, GROUND_KEYS } from "../src/theme/tokens.js";

/** Links in the catalog go nowhere: following one would navigate the preview frame away. */
function StoryLink({ ref, href, onClick, children, ...props }: LinkProps) {
  return (
    <a
      ref={ref}
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

/**
 * The toolbar's appearance, as the person's preference for the product in
 * the toolbar. Controlled, so the toolbar never fights localStorage; a story
 * that changes appearance (the picker) changes it here until the toolbar
 * moves again.
 */
function StoryAppearance({
  globals,
  unset,
  children,
}: {
  globals: Record<string, string>;
  /** `parameters.appearance.unset`: the person has never chosen, so org and product defaults show. */
  unset: boolean;
  children: React.ReactNode;
}) {
  const product = PRODUCTS[globals.product ?? ""] ?? astrolift;
  const [value, setValue] = React.useState<Partial<Appearance> | null>(() =>
    unset
      ? null
      : {
          ground: globals.ground as Appearance["ground"],
          accent: globals.accent === "product" ? product.defaults.accent : globals.accent,
          density: globals.density as Appearance["density"],
          corners: Number(globals.corners) as Appearance["corners"],
        }
  );
  return (
    <>
      <style data-calliope-ui="product">{productStyles(product)}</style>
      <AppearanceProvider product={product} value={value} onChange={setValue}>
        {children}
      </AppearanceProvider>
    </>
  );
}

const withProviders: Decorator = (Story, context) => {
  const globals = context.globals as Record<string, string>;
  const unset = Boolean((context.parameters.appearance as { unset?: boolean } | undefined)?.unset);
  return (
    <UIProvider link={StoryLink}>
      <StoryAppearance key={JSON.stringify(globals)} globals={globals} unset={unset}>
        <Story />
      </StoryAppearance>
    </UIProvider>
  );
};

const toolbar = (title: string, items: readonly (string | { value: string; title: string })[]) => ({
  description: title,
  toolbar: { title, items: [...items], dynamicTitle: true },
});

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    product: toolbar("Product", [
      { value: "astrolift", title: "Astrolift AI" },
      { value: "zentinelle", title: "Zentinelle AI" },
    ]),
    ground: toolbar("Ground", GROUND_KEYS),
    accent: toolbar("Accent", [{ value: "product", title: "Product accent" }, ...ACCENT_KEYS]),
    density: toolbar("Density", DENSITY_KEYS),
    corners: toolbar(
      "Corners",
      CORNERS.map((c) => ({ value: String(c), title: `${c}px` }))
    ),
  },
  initialGlobals: {
    product: "astrolift",
    ground: "graphite",
    accent: "product",
    density: "compact",
    corners: "2",
  },
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    controls: { expanded: true },
    a11y: {
      // Fail on violations (the story render test runs this too), against
      // the WCAG A and AA rules; best-practice rules are advice, not a gate.
      test: "error",
      options: {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      },
    },
  },
};

export default preview;
