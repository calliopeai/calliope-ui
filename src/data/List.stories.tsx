import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpenIcon, GitBranchIcon, KeyRoundIcon, PlugIcon, WebhookIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "../primitives/Button.js";
import { StatusBadge } from "../status/StatusBadge.js";
import { type ListProps, List, ListItem } from "./List.js";

interface Integration {
  id: string;
  name: string;
  blurb: string;
  icon: React.ReactNode;
  connected: boolean;
  updated: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    blurb: "Builds on push and pull request.",
    icon: <GitBranchIcon />,
    connected: true,
    updated: "2d ago",
  },
  {
    id: "slack",
    name: "Slack",
    blurb: "Alerts and approvals in a channel.",
    icon: <WebhookIcon />,
    connected: true,
    updated: "5h ago",
  },
  {
    id: "vault",
    name: "Vault",
    blurb: "Secrets resolved at deploy time.",
    icon: <KeyRoundIcon />,
    connected: false,
    updated: "never",
  },
  {
    id: "docs",
    name: "Docs search",
    blurb: "The assistant reads your runbooks.",
    icon: <BookOpenIcon />,
    connected: false,
    updated: "never",
  },
  {
    id: "zentinelle",
    name: "Zentinelle AI",
    blurb: "Policies, budgets and audit for every agent.",
    icon: <PlugIcon />,
    connected: true,
    updated: "1m ago",
  },
];

/**
 * A short list in the person's density. Switch Density in the toolbar:
 * compact is one panel of hairline rows; cards boxes the items into columns.
 */
const meta = {
  title: "Data/List",
  component: List,
} satisfies Meta<typeof List>;
export default meta;

function Integrations(props: Partial<ListProps<Integration>>) {
  return (
    <List
      label="Integrations"
      items={INTEGRATIONS}
      getKey={(i) => i.id}
      empty={{ title: "No integrations", description: "Connect a provider to see it here." }}
      renderItem={(i) => (
        <ListItem
          title={i.name}
          href={`/settings/integrations/${i.id}`}
          description={i.blurb}
          icon={i.icon}
          meta={i.updated}
          status={
            <StatusBadge tone={i.connected ? "ok" : "muted"}>
              {i.connected ? "connected" : "off"}
            </StatusBadge>
          }
          actions={
            <Button size="xs" variant="outline">
              {i.connected ? "Configure" : "Connect"}
            </Button>
          }
        />
      )}
      {...props}
    />
  );
}

export const PersonsDensity: StoryObj = { render: () => <Integrations /> };
export const Compact: StoryObj = { render: () => <Integrations density="compact" /> };
export const Cards: StoryObj = { render: () => <Integrations density="cards" /> };
export const Loading: StoryObj = { render: () => <Integrations loading /> };
export const Empty: StoryObj = { render: () => <Integrations items={[]} /> };
export const ErrorState: StoryObj = {
  render: () => <Integrations error={{ message: "The integrations service is down." }} />,
};
export const Narrow: StoryObj = {
  render: () => (
    <div className="w-192">
      <Integrations density="cards" />
    </div>
  ),
};
