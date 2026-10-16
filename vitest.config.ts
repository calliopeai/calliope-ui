import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    // The persistent transform cache keeps a module's import.meta.glob
    // expansion from an earlier run, so a new story file would be skipped by
    // the story tests without a word. Correctness first.
    fsModuleCache: false,
    // The a11y addon fails a story with violations only in a standalone
    // Vitest run, which it detects through this variable; it has to be
    // inlined so Vite substitutes `import.meta.env` inside it.
    env: { VITEST_STORYBOOK: "false" },
    server: { deps: { inline: ["@storybook/addon-a11y"] } },
  },
});
