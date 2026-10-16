import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServerIcon } from "lucide-react";

import { Button } from "../primitives/Button.js";
import { EmptyState } from "./EmptyState.js";

const meta = {
  title: "States/EmptyState",
  component: EmptyState,
  args: {
    icon: <ServerIcon />,
    title: "No clusters yet",
    description: "Register a cluster to deploy apps and agents to it.",
    actionHref: "/clusters/new",
    actionLabel: "Register a cluster",
    learnMoreHref: "/documentation/clusters",
  },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithAction: Story = {};

export const ExternalLearnMore: Story = {
  args: { learnMoreHref: "https://docs.astrolift.ai/clusters" },
};

export const TitleOnly: Story = {
  args: {
    icon: undefined,
    description: undefined,
    actionHref: undefined,
    learnMoreHref: undefined,
  },
};

export const WithSecondary: Story = {
  args: {
    secondary: (
      <Button variant="ghost" size="sm">
        Import from a kubeconfig
      </Button>
    ),
  },
};

export const LongStrings: Story = {
  args: {
    title: "No deployments match every filter you have set on this list",
    description:
      "Deployments appear here once an app has a successful build in at least one environment the organization has access to.",
  },
};
