import type { Meta, StoryObj } from "@storybook/react-vite";
import { BotIcon, BookOpenIcon, PaletteIcon, SendIcon, SparklesIcon, UserIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { DataTable } from "../data/DataTable.js";
import { List, ListItem } from "../data/List.js";
import { fixtureController } from "../data/table.fixtures.js";
import type { Column } from "../data/types.js";
import { activeFor, areaSwitcher, visibleNav } from "../nav/model.js";
import { PageFrame } from "../page/PageFrame.js";
import { Section } from "../page/Section.js";
import { Button } from "../primitives/Button.js";
import { AppShell } from "../shell/AppShell.js";
import { BrandMark } from "../shell/BrandMark.js";
import { RailPanel } from "../shell/RailPanel.js";
import { Sidebar } from "../shell/Sidebar.js";
import { UserMenu } from "../shell/UserMenu.js";
import { EmptyState } from "../states/EmptyState.js";
import { StatusBadge } from "../status/StatusBadge.js";
import type { StatusTone } from "../status/tones.js";
import {
  ZENTINELLE_MARK,
  ZENTINELLE_NAV,
  ZENTINELLE_ROLES,
  type ZentinelleRole,
} from "./products.js";
import { ExampleRouter, usePath } from "./router.js";

/**
 * Zentinelle AI, whole (ui-overhaul-ia §4 and §5): the seven areas filtered
 * by role, the navy sidebar and teal accent on a black ground, and the
 * assistant docked in the right rail: 400px, resizable from 320 to 560,
 * collapsing to nothing, full width on demand, opened from the header or `]`.
 */
const meta = {
  title: "Examples/Zentinelle shell",
  parameters: { layout: "fullscreen" },
  globals: { product: "zentinelle", ground: "black" },
} satisfies Meta;
export default meta;

interface AgentRow {
  id: string;
  name: string;
  status: "online" | "offline" | "blocked";
  policies: number;
  spend: string;
  seen: string;
}

const AGENTS: AgentRow[] = [
  {
    id: "a-7f3c",
    name: "support-bot",
    status: "online",
    policies: 6,
    spend: "$448 / $400",
    seen: "now",
  },
  {
    id: "a-1d9e",
    name: "triage-agent",
    status: "online",
    policies: 4,
    spend: "$208 / $200",
    seen: "1m ago",
  },
  {
    id: "a-55b2",
    name: "nightly-sync",
    status: "offline",
    policies: 3,
    spend: "$12 / $50",
    seen: "9h ago",
  },
  {
    id: "a-c041",
    name: "billing-reconcile",
    status: "blocked",
    policies: 5,
    spend: "$0 / $100",
    seen: "2d ago",
  },
];

const AGENT_TONE: Record<AgentRow["status"], StatusTone> = {
  online: "ok",
  offline: "muted",
  blocked: "error",
};

const AGENT_COLUMNS: Column<AgentRow>[] = [
  {
    id: "name",
    header: "Agent",
    cell: (a) => <span className="font-medium">{a.name}</span>,
    sortKey: "name",
  },
  {
    id: "status",
    header: "Status",
    cell: (a) => <StatusBadge tone={AGENT_TONE[a.status]}>{a.status}</StatusBadge>,
  },
  {
    id: "policies",
    header: "Policies",
    cell: (a) => <span className="font-mono">{a.policies}</span>,
    align: "right",
  },
  {
    id: "spend",
    header: "Spend / budget",
    cell: (a) => <span className="font-mono">{a.spend}</span>,
    align: "right",
  },
  { id: "seen", header: "Last seen", cell: (a) => a.seen, sortKey: "seen" },
];

function OverviewPage() {
  return (
    <PageFrame
      title="Overview"
      description="What needs a person, across every agent in the organization."
    >
      <Section title="Needs attention">
        <List
          label="Needs attention"
          items={[
            {
              key: "approvals",
              title: "3 approvals waiting",
              body: "Held actions from support-bot and triage-agent.",
              href: "/agents/approvals",
              tone: "warn" as StatusTone,
              badge: "waiting",
            },
            {
              key: "incident",
              title: "Incident INC-204",
              body: "Prompt injection attempt blocked on support-bot.",
              href: "/incidents",
              tone: "error" as StatusTone,
              badge: "open",
            },
            {
              key: "changes",
              title: "2 policy changes staged",
              body: "Budget raise for support-bot; new content rule.",
              href: "/policies",
              tone: "info" as StatusTone,
              badge: "staged",
            },
          ]}
          getKey={(i) => i.key}
          empty={{ title: "Nothing needs attention" }}
          renderItem={(i) => (
            <ListItem
              title={i.title}
              href={i.href}
              description={i.body}
              status={<StatusBadge tone={i.tone}>{i.badge}</StatusBadge>}
            />
          )}
        />
      </Section>
    </PageFrame>
  );
}

function AgentsPage({ viewer }: { viewer: ZentinelleRole }) {
  const nav = visibleNav(ZENTINELLE_NAV, (c) =>
    (ZENTINELLE_ROLES[viewer] as readonly string[]).includes(c)
  );
  return (
    <PageFrame
      crumbs={[areaSwitcher(nav, "agents", "agents")]}
      title="Agents"
      primaryAction={viewer === "viewer" ? undefined : <Button size="sm">Register agent</Button>}
      tabs={[
        { key: "all", label: "All", href: "?view=all", active: true },
        { key: "online", label: "Online", href: "?view=online", active: false },
        { key: "over-budget", label: "Over budget", href: "?view=over-budget", active: false },
      ]}
      tabsLabel="Views"
    >
      <DataTable
        label="Agents"
        controller={fixtureController<AgentRow>({
          rows: AGENTS,
          totalCount: AGENTS.length,
          sort: { key: "name", dir: "asc" },
        })}
        columns={AGENT_COLUMNS}
        getRowId={(a) => a.id}
        rowHref={(a) => `/agents/${a.id}/activity`}
        empty={{
          icon: <BotIcon />,
          title: "No agents yet",
          description: "Agents appear when they first call the gateway with an enrollment key.",
        }}
        searchPlaceholder="Search agents"
      />
    </PageFrame>
  );
}

function OtherPage({ label }: { label: string }) {
  return (
    <PageFrame title={label}>
      <EmptyState
        title={`No ${label.toLowerCase()} in this example`}
        description="The example shell has two pages: Overview and Agents."
        actionHref="/agents"
        actionLabel="Back to Agents"
      />
    </PageFrame>
  );
}

interface Message {
  id: number;
  from: "assistant" | "you";
  text: string;
}

const TRANSCRIPT: Message[] = [
  {
    id: 1,
    from: "assistant",
    text: "Two agents are over their monthly budget: support-bot at 112% and triage-agent at 104%.",
  },
  { id: 2, from: "you", text: "Which policy covers support-bot?" },
  {
    id: 3,
    from: "assistant",
    text: "Budget: support tier, a budget limit of $400 a month. I can draft a raise for someone to approve.",
  },
];

/** The dock's content: a transcript and a composer. The conversation is held above the shell, so it survives navigation. */
function Assistant({ messages, onSend }: { messages: Message[]; onSend: (text: string) => void }) {
  const [draft, setDraft] = React.useState("");
  const inputId = React.useId();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ol
        aria-label="Conversation"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((m) => (
          <li
            key={m.id}
            className={
              m.from === "you"
                ? "max-w-[85%] self-end rounded-lg bg-primary/15 px-3 py-2 text-sm"
                : "max-w-[85%] rounded-lg bg-card px-3 py-2 text-sm"
            }
          >
            <span className="sr-only">{m.from === "you" ? "You: " : "Assistant: "}</span>
            {m.text}
          </li>
        ))}
      </ol>
      <form
        className="flex items-end gap-2 border-t border-sidebar-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim()) onSend(draft.trim());
          setDraft("");
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Message the assistant
        </label>
        <textarea
          id={inputId}
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about policies, agents or spend"
          className="min-h-10 flex-1 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" size="icon" aria-label="Send">
          <SendIcon aria-hidden />
        </Button>
      </form>
    </div>
  );
}

function Shell({
  viewer,
  startDock = "open",
}: {
  /** The signed-in person's role. */
  viewer: ZentinelleRole;
  startDock?: "open" | "hidden" | "full";
}) {
  const { path } = usePath();
  const nav = visibleNav(ZENTINELLE_NAV, (c) =>
    (ZENTINELLE_ROLES[viewer] as readonly string[]).includes(c)
  );
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [dockHidden, setDockHidden] = React.useState(startDock === "hidden");
  const [dockFull, setDockFull] = React.useState(startDock === "full");
  const [dockWidth, setDockWidth] = React.useState(400);
  const [messages, setMessages] = React.useState(TRANSCRIPT);

  const active = activeFor(nav, path);
  const page =
    path === "/dashboard" ? (
      <OverviewPage />
    ) : path === "/agents" ? (
      <AgentsPage viewer={viewer} />
    ) : (
      <OtherPage
        label={
          nav.flatMap((a) => a.groups.flatMap((g) => g.functions)).find((f) => f.key === active?.fn)
            ?.label ?? "Page"
        }
      />
    );

  return (
    <AppShell
      onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
      onToggleRightRail={() => setDockHidden((h) => !h)}
      header={
        <div className="flex w-full items-center justify-end">
          {/* Beside the content only: below md the shell's own top bar opens the dock as a drawer. */}
          <Button
            size="sm"
            variant={dockHidden ? "outline" : "secondary"}
            aria-pressed={!dockHidden}
            title="Assistant (])"
            onClick={() => setDockHidden((h) => !h)}
            className="hidden md:inline-flex"
          >
            <SparklesIcon aria-hidden /> Assistant
          </Button>
        </div>
      }
      sidebar={
        <Sidebar
          nav={nav}
          active={active}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          header={<BrandMark href="/dashboard" mark={ZENTINELLE_MARK} />}
          headerCollapsed={<BrandMark href="/dashboard" mark={ZENTINELLE_MARK} collapsed />}
          footer={
            <UserMenu
              name="Leo Mata"
              email="leo@calliope.ai"
              onSignOut={() => {}}
              groups={[
                [
                  { label: "Profile", href: "/profile", icon: UserIcon },
                  { label: "Appearance", href: "/profile/appearance", icon: PaletteIcon },
                ],
                [{ label: "Documentation", href: "/docs", icon: BookOpenIcon }],
              ]}
            />
          }
        />
      }
      rightRail={
        <RailPanel
          label="Assistant"
          collapsed={dockHidden}
          onCollapsedChange={setDockHidden}
          collapsedMode="hidden"
          width={dockWidth}
          minWidth={320}
          maxWidth={560}
          onWidthChange={setDockWidth}
          expanded={dockFull}
          onExpandedChange={setDockFull}
        >
          <Assistant
            messages={messages}
            onSend={(text) => setMessages((m) => [...m, { id: m.length + 1, from: "you", text }])}
          />
        </RailPanel>
      }
      rightRailLabel="Assistant"
      rightRailExpanded={dockFull && !dockHidden}
    >
      {page}
    </AppShell>
  );
}

export const Admin: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/agents">
      <Shell viewer="admin" />
    </ExampleRouter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("complementary", { name: "Assistant" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Assistant", pressed: true }));
    await expect(
      canvas.queryByRole("complementary", { name: "Assistant" })
    ).not.toBeInTheDocument();
  },
};

/** A viewer sees no Settings, Evidence or Providers, and no Register action. */
export const Viewer: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/agents">
      <Shell viewer="viewer" />
    </ExampleRouter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Register agent" })).not.toBeInTheDocument();
  },
};

export const Overview: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/dashboard">
      <Shell viewer="operator" />
    </ExampleRouter>
  ),
};

export const AssistantHidden: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/agents">
      <Shell viewer="admin" startDock="hidden" />
    </ExampleRouter>
  ),
};

/** The assistant expanded over the content column: what replaces the /assistant page. */
export const AssistantFullWidth: StoryObj = {
  render: () => (
    <ExampleRouter initialPath="/agents">
      <Shell viewer="admin" startDock="full" />
    </ExampleRouter>
  ),
};

export const Mobile: StoryObj = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <ExampleRouter initialPath="/agents">
      <Shell viewer="admin" />
    </ExampleRouter>
  ),
};
