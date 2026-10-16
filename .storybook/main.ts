import type { StorybookConfig } from "@storybook/react-vite";

/**
 * The catalog: every component in every state, and the two consoles' shells
 * whole. Storybook first: a component is built and reviewed here before an
 * app uses it.
 */
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  core: { disableTelemetry: true },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] });
  },
};

export default config;
