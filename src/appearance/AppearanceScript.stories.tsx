import type { Meta, StoryObj } from "@storybook/react-vite";

import { astrolift, zentinelle } from "../examples/products.js";
import { AppearanceScript } from "./AppearanceScript.js";
import { appearanceScript, productStyles } from "./boot.js";
import type { Product } from "./product.js";

/**
 * What a root layout renders in <head>: the product's brand tokens and the
 * script that applies the stored appearance before first paint. It belongs
 * in server-rendered HTML (a script React inserts on the client never runs),
 * so the catalog shows what it emits rather than mounting it.
 */
const meta = {
  title: "Appearance/AppearanceScript",
  component: AppearanceScript,
} satisfies Meta<typeof AppearanceScript>;
export default meta;

function Source({ product }: { product: Product }) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        &lt;style&gt; for {product.name}: its sidebar, and its own accent when it has one.
      </p>
      <pre className="overflow-x-auto rounded-lg border bg-card p-3 font-mono text-xs whitespace-pre-wrap">
        {productStyles(product)}
      </pre>
      <p className="text-sm text-muted-foreground">&lt;script&gt;, reading {product.storageKey}:</p>
      <pre className="max-h-80 overflow-auto rounded-lg border bg-card p-3 font-mono text-xs whitespace-pre-wrap">
        {appearanceScript(product)}
      </pre>
    </div>
  );
}

export const Astrolift: StoryObj = { render: () => <Source product={astrolift} /> };
export const Zentinelle: StoryObj = { render: () => <Source product={zentinelle} /> };
