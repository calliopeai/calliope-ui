import { appearanceScript, productStyles } from "./boot.js";
import type { Product } from "./product.js";

export interface AppearanceScriptProps {
  product: Product;
  /** The page's CSP nonce, when inline style and script need one. */
  nonce?: string;
}

/**
 * Render in <head>, before anything paints: the product's brand tokens (its
 * sidebar and its own accent) and the script that stamps the person's ground,
 * accent, density and corners on <html> from localStorage. Without it the page
 * paints the defaults and swaps once React hydrates, which reads as a flash.
 *
 * Not a client component: it renders the same markup on the server and needs
 * no hooks, so a Next root layout can render it directly.
 */
export function AppearanceScript({ product, nonce }: AppearanceScriptProps) {
  return (
    <>
      <style
        nonce={nonce}
        data-calliope-ui="product"
        dangerouslySetInnerHTML={{ __html: productStyles(product) }}
      />
      <script
        nonce={nonce}
        data-calliope-ui="appearance"
        dangerouslySetInnerHTML={{ __html: appearanceScript(product) }}
      />
    </>
  );
}
