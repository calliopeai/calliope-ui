/**
 * Builds dist/: per-file ESM and declarations from tsc (so each client
 * component keeps its own "use client" and pure modules stay importable from
 * Server Components), plus the two stylesheets.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);

rmSync(`${root}dist`, { recursive: true, force: true });
execFileSync(
  process.execPath,
  [require.resolve("typescript/bin/tsc"), "-p", "tsconfig.build.json"],
  {
    cwd: root,
    stdio: "inherit",
  }
);
mkdirSync(`${root}dist/styles`, { recursive: true });
for (const file of ["theme.css", "preset.css"]) {
  cpSync(`${root}src/styles/${file}`, `${root}dist/styles/${file}`);
}
console.log("built dist/");
