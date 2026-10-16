/**
 * The two consoles as the catalog shows them: each brand with its
 * navigation model. Astrolift's is its nav model at origin/main 8edb40d
 * (`frontend/lib/shell/nav-model.ts`), with module gates as capabilities;
 * Zentinelle's is the seven areas of ui-overhaul-ia §4.1, gated by role.
 * Story fixtures: not part of the published package.
 */
import {
  ActivityIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  BotIcon,
  BoxesIcon,
  BrainCircuitIcon,
  BuildingIcon,
  CalendarClockIcon,
  ClipboardListIcon,
  CloudIcon,
  EyeIcon,
  FileCheckIcon,
  FileTextIcon,
  FlagIcon,
  FolderIcon,
  GaugeIcon,
  GlobeIcon,
  HistoryIcon,
  HomeIcon,
  KeyRoundIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  PackageIcon,
  PlugIcon,
  RocketIcon,
  ScaleIcon,
  ScrollTextIcon,
  ServerIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SirenIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  UsersIcon,
  WebhookIcon,
  WorkflowIcon,
  WrenchIcon,
} from "lucide-react";

import { astroliftBrand, zentinelleBrand } from "../appearance/brands.js";
import { defineProduct, type Product } from "../appearance/product.js";
import type { NavModel } from "../nav/model.js";

export const ASTROLIFT_NAV: NavModel = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
    flat: true,
    groups: [{ functions: [{ key: "home", label: "Home", href: "/dashboard", icon: HomeIcon }] }],
  },
  {
    key: "agents",
    label: "Agents",
    icon: BotIcon,
    groups: [
      {
        functions: [
          { key: "agents", label: "Agents", href: "/agents", icon: BotIcon, requires: "agents" },
          { key: "fleet", label: "Fleet", href: "/fleet", icon: BoxesIcon, requires: "agents" },
          {
            key: "approvals",
            label: "Approvals",
            href: "/gates",
            icon: ClipboardListIcon,
            requires: "agents",
          },
          {
            key: "workflows",
            label: "Workflows",
            href: "/workflows",
            icon: WorkflowIcon,
            requires: "workflows",
          },
          {
            key: "runs",
            label: "Runs",
            href: "/tasks",
            icon: ClipboardListIcon,
            requires: "agents",
          },
          {
            key: "skills",
            label: "Skills",
            href: "/agents/skills",
            icon: BookOpenIcon,
            requires: "agents",
          },
          {
            key: "tools",
            label: "Tools",
            href: "/agents/tools",
            icon: WrenchIcon,
            requires: "agents",
          },
          {
            key: "models",
            label: "Models",
            href: "/models",
            icon: BrainCircuitIcon,
            requires: "models",
          },
          {
            key: "workloads",
            label: "Workloads",
            href: "/workloads",
            icon: BoxesIcon,
            requires: "agents",
          },
        ],
      },
    ],
  },
  {
    key: "apps",
    label: "Apps",
    icon: PackageIcon,
    groups: [
      {
        functions: [
          { key: "apps", label: "Apps", href: "/apps", icon: PackageIcon, requires: "apps" },
          {
            key: "brains",
            label: "Semantic layers",
            href: "/brains",
            icon: BrainCircuitIcon,
            requires: "apps",
          },
          {
            key: "pipelines",
            label: "Pipelines",
            href: "/pipelines",
            icon: WorkflowIcon,
            requires: "apps",
          },
          {
            key: "deployments",
            label: "Deployments",
            href: "/deployments",
            icon: RocketIcon,
            requires: "apps",
          },
          {
            key: "jobs",
            label: "Scheduled jobs",
            href: "/jobs",
            icon: CalendarClockIcon,
            requires: "apps",
          },
          {
            key: "environments",
            label: "Environments",
            href: "/environments",
            icon: LayersIcon,
            requires: "apps",
          },
          {
            key: "previews",
            label: "Previews",
            href: "/previews",
            icon: EyeIcon,
            requires: "apps",
          },
        ],
      },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    icon: SettingsIcon,
    groups: [
      {
        key: "organization",
        label: "Organization",
        functions: [
          {
            key: "organization",
            label: "Organization",
            href: "/administration/organization",
            icon: BuildingIcon,
            requires: "admin",
          },
          {
            key: "access",
            label: "Access",
            href: "/administration/access",
            icon: UsersIcon,
            requires: ["admin", "team_access"],
            also: ["/administration/permissions", "/administration/policies"],
          },
          {
            key: "projects",
            label: "Projects",
            href: "/administration/projects",
            icon: FolderIcon,
            requires: "admin",
          },
        ],
      },
      {
        key: "infrastructure",
        label: "Infrastructure",
        functions: [
          {
            key: "clusters",
            label: "Clusters",
            href: "/clusters",
            icon: ServerIcon,
            requires: "admin",
          },
          {
            key: "domains",
            label: "Domains",
            href: "/domains",
            icon: GlobeIcon,
            requires: "admin",
          },
          {
            key: "providers",
            label: "Providers",
            href: "/providers",
            icon: CloudIcon,
            requires: "admin",
          },
          {
            key: "webhooks",
            label: "Webhooks",
            href: "/webhooks",
            icon: WebhookIcon,
            requires: "admin",
          },
        ],
      },
      {
        key: "governance",
        label: "Usage & governance",
        functions: [
          {
            key: "metrics",
            label: "Metrics",
            href: "/administration/metrics",
            icon: GaugeIcon,
            requires: "admin",
          },
          {
            key: "tokens",
            label: "API keys",
            href: "/tokens",
            icon: KeyRoundIcon,
            requires: "admin",
          },
          {
            key: "audit",
            label: "Audit",
            href: "/administration/audit",
            icon: ScrollTextIcon,
            requires: "admin",
          },
          {
            key: "run-audit",
            label: "Runs",
            href: "/administration/runs",
            icon: HistoryIcon,
            requires: "admin",
          },
          {
            key: "features",
            label: "Features",
            href: "/administration/features",
            icon: FlagIcon,
            requires: "admin",
          },
          {
            key: "platform-settings",
            label: "Platform settings",
            href: "/administration/platform-settings",
            icon: SlidersHorizontalIcon,
            requires: "admin",
          },
        ],
      },
      {
        key: "signals",
        label: "Platform signals",
        functions: [
          {
            key: "activity",
            label: "Platform activity",
            href: "/platform-activity",
            icon: ActivityIcon,
            requires: "admin",
          },
          { key: "alerts", label: "Alerts", href: "/alerts", icon: BellIcon, requires: "admin" },
          { key: "logs", label: "Logs", href: "/logs", icon: ScrollTextIcon, requires: "admin" },
        ],
      },
    ],
  },
];

/** Zentinelle's roles, as capabilities: each role holds the ones below it. */
export const ZENTINELLE_ROLES = {
  viewer: ["view"],
  operator: ["view", "mutate"],
  admin: ["view", "mutate", "admin"],
} as const;

export type ZentinelleRole = keyof typeof ZENTINELLE_ROLES;

export const ZENTINELLE_NAV: NavModel = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboardIcon,
    flat: true,
    groups: [
      {
        functions: [
          { key: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
        ],
      },
    ],
  },
  {
    key: "agents",
    label: "Agents",
    icon: BotIcon,
    groups: [
      {
        functions: [
          { key: "agents", label: "Agents", href: "/agents", icon: BotIcon },
          { key: "groups", label: "Groups", href: "/agents/groups", icon: UsersIcon },
          {
            key: "approvals",
            label: "Approvals",
            href: "/agents/approvals",
            icon: ClipboardListIcon,
          },
        ],
      },
    ],
  },
  {
    key: "policies",
    label: "Policies",
    icon: ShieldCheckIcon,
    groups: [
      {
        functions: [
          { key: "policies", label: "Policies", href: "/policies", icon: ShieldCheckIcon },
          {
            key: "content-rules",
            label: "Content rules",
            href: "/content-rules",
            icon: FileCheckIcon,
          },
          { key: "prompts", label: "Prompt library", href: "/system-prompts", icon: LibraryIcon },
        ],
      },
    ],
  },
  {
    key: "activity",
    label: "Activity",
    icon: ActivityIcon,
    groups: [
      {
        functions: [
          { key: "alerts", label: "Alerts", href: "/alerts", icon: BellIcon },
          { key: "incidents", label: "Incidents", href: "/incidents", icon: SirenIcon },
          { key: "events", label: "Events", href: "/events", icon: ActivityIcon },
          { key: "audit-log", label: "Audit log", href: "/audit-logs", icon: ScrollTextIcon },
        ],
      },
    ],
  },
  {
    key: "risk",
    label: "Risk & compliance",
    icon: ScaleIcon,
    groups: [
      {
        functions: [
          { key: "risks", label: "Risks", href: "/risks", icon: ShieldAlertIcon },
          { key: "compliance", label: "Compliance", href: "/compliance", icon: ScaleIcon },
          {
            key: "evidence",
            label: "Evidence",
            href: "/evidence",
            icon: FileCheckIcon,
            requires: "admin",
          },
          { key: "reports", label: "Reports", href: "/reports", icon: FileTextIcon },
        ],
      },
    ],
  },
  {
    key: "models",
    label: "Models & usage",
    icon: BarChart3Icon,
    groups: [
      {
        functions: [
          { key: "usage", label: "Usage", href: "/usage", icon: BarChart3Icon },
          { key: "models", label: "Models", href: "/models", icon: BrainCircuitIcon },
          {
            key: "providers",
            label: "Providers",
            href: "/models/providers",
            icon: PlugIcon,
            requires: "admin",
          },
        ],
      },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
    groups: [
      {
        functions: [
          {
            key: "general",
            label: "General",
            href: "/settings",
            icon: SettingsIcon,
            requires: "admin",
          },
          {
            key: "api-keys",
            label: "API keys",
            href: "/settings/api-keys",
            icon: KeyRoundIcon,
            requires: "admin",
          },
          {
            key: "integrations",
            label: "Integrations",
            href: "/settings/astrolift",
            icon: PlugIcon,
            requires: "admin",
          },
          {
            key: "retention",
            label: "Data retention",
            href: "/settings/retention",
            icon: HistoryIcon,
            requires: "admin",
          },
          {
            key: "assistant",
            label: "Assistant",
            href: "/settings/assistant",
            icon: SparklesIcon,
            requires: "admin",
          },
        ],
      },
    ],
  },
];

export const astrolift = defineProduct({ ...astroliftBrand, nav: ASTROLIFT_NAV });
export const zentinelle = defineProduct({ ...zentinelleBrand, nav: ZENTINELLE_NAV });

export const PRODUCTS: Record<string, Product> = { astrolift, zentinelle };

/** Illustrative marks for the catalog; each app passes its own logo. */
export const ASTROLIFT_MARK = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="text-primary"
  >
    <circle cx="12" cy="14" r="6" />
    <path d="M3 9.5c4-2 14-2 18 0" strokeLinecap="round" />
  </svg>
);

export const ZENTINELLE_MARK = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="text-primary"
  >
    <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z" strokeLinejoin="round" />
  </svg>
);
