/**
 * Checks the package as a consumer receives it, after `npm run build`:
 *  1. the tarball holds dist/, the README and the licence, and nothing else
 *     (no stories, tests, fixtures, examples or sources);
 *  2. every `exports` target exists, and Node, whose ESM resolution is as
 *     strict as a bundler's, can import the entry and finds the public API;
 *  3. "use client" sits on the client components and not on the pure modules
 *     a Server Component imports;
 *  4. Tailwind, given only the preset, generates the components' utilities
 *     and the theme's blocks.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

// 1. Tarball contents.
const [packed] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: root,
    encoding: "utf8",
  })
);
const files = packed.files.map((f) => f.path);
for (const required of [
  "package.json",
  "README.md",
  "LICENSE",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/styles/theme.css",
  "dist/styles/preset.css",
]) {
  check(files.includes(required), `tarball is missing ${required}`);
}
for (const file of files) {
  check(
    file === "package.json" ||
      file === "README.md" ||
      file === "LICENSE" ||
      file.startsWith("dist/"),
    `tarball holds an unexpected file: ${file}`
  );
  check(
    !/\.(stories|test)\.|fixtures|\/examples\/|\/test\//.test(file),
    `tarball holds a catalog or test file: ${file}`
  );
}

// 2. Exports resolve and the entry imports.
for (const [subpath, target] of Object.entries(pkg.exports)) {
  const targets = typeof target === "string" ? [target] : Object.values(target);
  for (const t of targets)
    check(existsSync(path.join(root, t)), `export ${subpath} points at a missing ${t}`);
}
const api = await import(pathToFileURL(path.join(root, "dist/index.js")).href);
for (const name of [
  "AppShell",
  "Sidebar",
  "Nav",
  "PageFrame",
  "DataTable",
  "List",
  "StatusBadge",
  "AppearanceProvider",
  "AppearanceScript",
  "defineProduct",
  "visibleNav",
  "astroliftBrand",
  "zentinelleBrand",
]) {
  check(name in api, `the entry does not export ${name}`);
}

// 3. Client and server boundaries.
const firstLine = (file) => readFileSync(path.join(root, "dist", file), "utf8").split("\n")[0];
for (const file of [
  "shell/AppShell.js",
  "data/DataTable.js",
  "appearance/AppearanceProvider.js",
  "nav/Nav.js",
]) {
  check(firstLine(file) === '"use client";', `${file} lost its "use client"`);
}
for (const file of [
  "index.js",
  "nav/model.js",
  "appearance/appearance.js",
  "appearance/product.js",
  "appearance/boot.js",
  "appearance/AppearanceScript.js",
  "theme/tokens.js",
]) {
  check(
    firstLine(file) !== '"use client";',
    `${file} is marked "use client" but must stay usable on the server`
  );
}

// 4. The preset, from outside the package.
const probe = mkdtempSync(path.join(root, ".pack-check-"));
try {
  writeFileSync(
    path.join(probe, "app.css"),
    `@import "tailwindcss";\n@import "${path.join(root, "dist/styles/preset.css").replaceAll("\\", "/")}";\n`
  );
  const cli = path.join(
    path.dirname(require.resolve("@tailwindcss/cli/package.json")),
    "dist/index.mjs"
  );
  execFileSync(process.execPath, [cli, "-i", "app.css", "-o", "out.css"], {
    cwd: probe,
    stdio: "pipe",
  });
  const css = readFileSync(path.join(probe, "out.css"), "utf8");
  for (const expected of [
    ".bg-sidebar",
    ".text-success-fg",
    ".grid-cols-\\(--list-columns\\)",
    '[data-mode="dark"][data-ground="charcoal"]',
    '[data-density="cards"]',
    "--brand-primary",
  ]) {
    check(css.includes(expected), `the preset did not produce ${expected}`);
  }
} finally {
  rmSync(probe, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`package check failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`package check passed: ${files.length} files, ${Object.keys(api).length} exports`);
