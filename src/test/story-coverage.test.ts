import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as api from "../index.js";

/**
 * Storybook first: no component reaches an app unless it is in the catalog.
 * Two holds, with no allowlist:
 *  - every component the package exports appears in a story, and
 *  - every file under src/ that defines a component has a sibling story.
 */
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

const all = files(SRC);
const stories = all.filter((file) => file.endsWith(".stories.tsx"));

/** Every identifier a story file imports from the package source. */
function importedByStories(): Set<string> {
  const names = new Set<string>();
  const IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["'](\.{1,2}\/[^"']+)["']/g;
  for (const file of stories) {
    for (const match of readFileSync(file, "utf8").matchAll(IMPORT)) {
      for (const spec of (match[1] ?? "").split(",")) {
        const name = spec
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0];
        if (name) names.add(name);
      }
    }
  }
  return names;
}

describe("story coverage", () => {
  it("covers every exported component", () => {
    const components = Object.entries(api)
      .filter(([name, value]) => typeof value === "function" && /^[A-Z]/.test(name))
      .map(([name]) => name);
    // A guard that the list is real, so the next assertion cannot pass empty.
    expect(components.length).toBeGreaterThan(40);
    const imported = importedByStories();
    const missing = components.filter((name) => !imported.has(name)).sort();
    expect(missing, `exported components no story imports (${missing.length})`).toEqual([]);
  });

  it("gives every component file a sibling story", () => {
    const componentFiles = all.filter(
      (file) =>
        file.endsWith(".tsx") &&
        !/\.(stories|test)\.tsx$/.test(file) &&
        !file.includes(`${path.sep}examples${path.sep}`) &&
        /export function [A-Z]/.test(readFileSync(file, "utf8"))
    );
    expect(componentFiles.length).toBeGreaterThan(20);
    const missing = componentFiles
      .filter((file) => !all.includes(file.replace(/\.tsx$/, ".stories.tsx")))
      .map((file) => path.relative(SRC, file))
      .sort();
    expect(missing, `component files with no story (${missing.length})`).toEqual([]);
  });
});
