import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ErrorState } from "./ErrorState.js";

const meta = {
  title: "States/ErrorState",
  component: ErrorState,
  args: { title: "Could not load runs", error: "upstream timed out after 30s", onRetry: fn() },
} satisfies Meta<typeof ErrorState>;
export default meta;

type Story = StoryObj<typeof meta>;

/** One query failed: a callout inside the page. */
export const Inline: Story = {};

export const WithoutRetry: Story = { args: { onRetry: undefined } };

/** The error boundary: the whole surface, with a digest to trace and a way out. */
export const Page: Story = {
  args: {
    variant: "page",
    title: undefined,
    error: "Cannot read the deployment's manifest.",
    digest: "3f9a1c2e",
    homeHref: "/dashboard",
    homeLabel: "Go to the dashboard",
  },
};

export const NoMessage: Story = { args: { error: null } };

export const LongMessage: Story = {
  args: {
    error:
      "GraphQL error: field astroliftDeploymentsPage could not be resolved for organization 4f8c1a72-1b3e-4c0e-9d5e-6a0f2b9c7d11 because the upstream service returned 503",
  },
};
