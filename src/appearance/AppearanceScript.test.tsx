import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppearanceScript } from "./AppearanceScript.js";
import { zentinelleBrand } from "./brands.js";
import { defineProduct } from "./product.js";

const zentinelle = defineProduct(zentinelleBrand);

describe("AppearanceScript", () => {
  it("server-renders the product's tokens and the boot script, with the CSP nonce", () => {
    const html = renderToString(<AppearanceScript product={zentinelle} nonce="r4nd0m" />);
    expect(html).toMatch(
      /^<style nonce="r4nd0m" data-calliope-ui="product">:root\{--brand-sidebar:#0b0b19\}/
    );
    expect(html).toContain('<script nonce="r4nd0m" data-calliope-ui="appearance">try{');
    expect(html).toContain('"key":"zentinelle.appearance"');
  });

  it("emits no nonce attribute without one", () => {
    expect(renderToString(<AppearanceScript product={zentinelle} />)).not.toContain("nonce");
  });
});
