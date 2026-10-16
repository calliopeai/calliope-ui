/** Story and test fixtures for rails: Astrolift's projects rail, in the RailTree shape. */
import { BotIcon, PackageIcon, WorkflowIcon } from "lucide-react";

import type { RailTreeGroup } from "./RailTree.js";

export const PROJECTS: RailTreeGroup[] = [
  {
    key: "storefront",
    label: "storefront",
    items: [
      {
        key: "checkout",
        label: "checkout",
        href: "/apps/checkout",
        icon: PackageIcon,
        status: "ok",
        statusLabel: "healthy",
      },
      {
        key: "billing-api",
        label: "billing-api",
        href: "/apps/billing-api",
        icon: PackageIcon,
        status: "error",
        statusLabel: "failing",
      },
      {
        key: "support-bot",
        label: "support-bot",
        href: "/agents/support-bot",
        icon: BotIcon,
        status: "info",
        statusLabel: "deploying",
      },
      {
        key: "nightly-sync",
        label: "nightly-sync",
        href: "/workflows/nightly-sync",
        icon: WorkflowIcon,
        status: "ok",
        statusLabel: "healthy",
      },
    ],
  },
  {
    key: "data-platform",
    label: "data-platform",
    items: [
      {
        key: "triage-agent",
        label: "triage-agent",
        href: "/agents/triage-agent",
        icon: BotIcon,
        status: "ok",
        statusLabel: "healthy",
      },
      {
        key: "ingest",
        label: "ingest",
        href: "/apps/ingest",
        icon: PackageIcon,
        status: "warn",
        statusLabel: "degraded",
      },
    ],
  },
  {
    key: "internal-tools",
    label: "internal-tools",
    items: [
      {
        key: "status-board",
        label: "status-board",
        href: "/apps/status-board",
        icon: PackageIcon,
        status: "muted",
        statusLabel: "paused",
      },
    ],
  },
];
