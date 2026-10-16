/**
 * Writes src/styles/theme.css from the token table (src/theme/tokens.ts).
 * `src/theme/theme-css.test.ts` fails when the committed file and this
 * output differ, so a token change always lands with its CSS.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { renderThemeCss } from "../src/theme/css.js";

const target = fileURLToPath(new URL("../src/styles/theme.css", import.meta.url));
writeFileSync(target, renderThemeCss());
console.log(`wrote ${target}`);
