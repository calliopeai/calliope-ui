import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs.js";

/** In-page tabs: panels on one URL. Tabs that are pages are TabNav. */
const meta = { title: "Primitives/Tabs", component: Tabs } satisfies Meta<typeof Tabs>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="organization" className="max-w-2xl">
      <TabsList aria-label="General settings">
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="runtime" disabled>
          Runtime
        </TabsTrigger>
      </TabsList>
      <TabsContent value="organization" className="text-sm text-muted-foreground">
        Name, domain and the default region for new agents.
      </TabsContent>
      <TabsContent value="enforcement" className="text-sm text-muted-foreground">
        Whether a policy that fails to evaluate blocks the request or lets it through.
      </TabsContent>
      <TabsContent value="notifications" className="text-sm text-muted-foreground">
        Who hears about critical alerts, and how.
      </TabsContent>
    </Tabs>
  ),
};

export const Narrow: Story = {
  render: () => (
    <Tabs defaultValue="a" className="w-80">
      <TabsList aria-label="Usage">
        <TabsTrigger value="a">Overview</TabsTrigger>
        <TabsTrigger value="b">Budgets</TabsTrigger>
        <TabsTrigger value="c">Anomalies</TabsTrigger>
        <TabsTrigger value="d">Forecast</TabsTrigger>
      </TabsList>
      <TabsContent value="a" className="text-sm text-muted-foreground">
        The tab row scrolls sideways when it runs out of room.
      </TabsContent>
    </Tabs>
  ),
};
