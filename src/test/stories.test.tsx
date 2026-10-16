/// <reference types="vite/client" />
import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import * as previewAnnotations from "../../.storybook/preview.js";

/**
 * Every story renders, through the catalog's own decorator, and passes the
 * a11y addon's WCAG A and AA checks (the preview sets `a11y.test: "error"`;
 * the addon fails a story with violations in a standalone Vitest run). A
 * Storybook build only proves the stories compile; this mounts each one and
 * runs its play function, so a component that throws in any state, or loses
 * a name or a label, fails the suite. Colour contrast needs real CSS and
 * layout, so in jsdom it is left to the token contrast tests.
 */
setProjectAnnotations([a11yAnnotations, previewAnnotations]);

type PortableStory = {
  run: (context: {
    canvasElement: HTMLElement;
    testingLibraryRender: typeof render;
  }) => Promise<void>;
};

const modules = import.meta.glob<Record<string, unknown>>("../**/*.stories.tsx", { eager: true });

describe.each(Object.entries(modules))("%s", (_file, module) => {
  const stories = Object.entries(
    composeStories(module as Parameters<typeof composeStories>[0])
  ) as [string, PortableStory][];
  it.each(stories)("%s renders", async (_name, story) => {
    const canvasElement = document.createElement("div");
    document.body.appendChild(canvasElement);
    // Storybook's renderer owns its own React root; hand it Testing Library's
    // render so cleanup can unmount it.
    await story.run({ canvasElement, testingLibraryRender: render });
    expect(canvasElement.childElementCount).toBeGreaterThan(0);
    canvasElement.remove();
  });
});
