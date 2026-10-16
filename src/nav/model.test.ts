import { HomeIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { activeFor, areaSwitcher, localizeNav, type NavModel, visibleNav } from "./model.js";

const NAV: NavModel = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
    flat: true,
    groups: [{ functions: [{ key: "home", label: "Home", href: "/dashboard" }] }],
  },
  {
    key: "agents",
    label: "Agents",
    icon: HomeIcon,
    groups: [
      {
        functions: [
          { key: "agents", label: "Agents", href: "/agents", requires: "agents" },
          { key: "skills", label: "Skills", href: "/agents/skills", requires: "agents" },
          { key: "workflows", label: "Workflows", href: "/workflows", requires: "workflows" },
        ],
      },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    icon: HomeIcon,
    groups: [
      {
        key: "org",
        label: "Organization",
        functions: [
          {
            key: "access",
            label: "Access",
            href: "/administration/access",
            requires: ["admin", "team_access"],
            also: ["/administration/policies"],
          },
        ],
      },
      {
        key: "infra",
        label: "Infrastructure",
        functions: [{ key: "clusters", label: "Clusters", href: "/clusters", requires: "admin" }],
      },
    ],
  },
];

const keys = (nav: NavModel) =>
  nav.map((a) => `${a.key}:${a.groups.flatMap((g) => g.functions.map((f) => f.key)).join(",")}`);

describe("visibleNav", () => {
  it("keeps everything for a viewer who can open everything", () => {
    expect(keys(visibleNav(NAV, () => true))).toEqual([
      "home:home",
      "agents:agents,skills,workflows",
      "admin:access,clusters",
    ]);
  });

  it("drops rows, then empty groups, then empty areas", () => {
    expect(keys(visibleNav(NAV, (c) => c === "workflows"))).toEqual([
      "home:home",
      "agents:workflows",
    ]);
  });

  it("shows a row when any one of its capabilities is held", () => {
    const nav = visibleNav(NAV, (c) => c === "team_access");
    expect(keys(nav)).toEqual(["home:home", "admin:access"]);
    expect(nav[1]!.groups).toHaveLength(1);
  });

  it("never shows a gated row to a viewer with no capabilities", () => {
    expect(keys(visibleNav(NAV, () => false))).toEqual(["home:home"]);
  });
});

describe("activeFor", () => {
  it("picks the longest matching prefix", () => {
    expect(activeFor(NAV, "/agents/skills/42")).toEqual({ area: "agents", fn: "skills" });
    expect(activeFor(NAV, "/agents/a-7f3c/activity")).toEqual({ area: "agents", fn: "agents" });
  });

  it("matches whole segments only, and ignores query and fragment", () => {
    expect(activeFor(NAV, "/agentsx")).toBeNull();
    expect(activeFor(NAV, "/clusters?view=all#top")).toEqual({ area: "admin", fn: "clusters" });
  });

  it("honours the other prefixes a row owns", () => {
    expect(activeFor(NAV, "/administration/policies/7")).toEqual({ area: "admin", fn: "access" });
  });

  it("returns null off the model", () => {
    expect(activeFor(NAV, "/settings/profile")).toBeNull();
  });
});

describe("areaSwitcher", () => {
  it("names the area and offers its functions with the current one checked", () => {
    expect(areaSwitcher(NAV, "agents", "skills")).toEqual({
      label: "Agents",
      switcher: [
        { label: "Agents", href: "/agents", active: false },
        { label: "Skills", href: "/agents/skills", active: true },
        { label: "Workflows", href: "/workflows", active: false },
      ],
    });
  });
});

describe("localizeNav", () => {
  it("passes every label through the translator, keeping the model's as fallback", () => {
    const es: Record<string, string> = {
      "area:agents": "Agentes",
      "group:org": "Organización",
      "function:skills": "Habilidades",
    };
    const nav = localizeNav(NAV, (kind, key, fallback) => es[`${kind}:${key}`] ?? fallback);
    expect(nav[1]!.label).toBe("Agentes");
    expect(nav[1]!.groups[0]!.functions.map((f) => f.label)).toEqual([
      "Agents",
      "Habilidades",
      "Workflows",
    ]);
    expect(nav[2]!.groups[0]!.label).toBe("Organización");
    expect(nav[0]!.groups[0]!.label).toBeUndefined();
  });
});
