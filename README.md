# @calliopelabs/ui

The shared operator UI of Calliope AI: the app shell, navigation, page frame, data table and list patterns, status colours, design tokens and appearance settings that Astrolift AI and Zentinelle AI both run on. Extracted from the Astrolift AI frontend and generalized with a per-product config, so each console keeps its own name, accent, sidebar colour and navigation while sharing everything else.

It is built Storybook first: every component and every screen pattern is built and reviewed in the catalog before an app uses it. The catalog is published at **https://calliopeai.github.io/calliope-ui/**.

- React 19 and TypeScript, shipped as per-file ESM with types. No Next-only APIs: the app hands the package its link component.
- Tailwind CSS 4: the theme tokens as CSS, plus a preset.
- Radix underneath the overlays and menus; lucide icons.

## Install

```sh
npm i @calliopelabs/ui
```

Peer dependencies: `react` and `react-dom` 19, and `tailwindcss` 4 for styling.

## Styles

In the app's global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "@calliopelabs/ui/preset.css";
```

The preset brings the theme tokens (`@calliopelabs/ui/theme.css`), maps them onto Tailwind's colour, radius, font, type and motion scales (`bg-primary`, `text-success-fg`, `bg-sidebar`, `rounded-lg`, `text-2xs`, `font-mono`), adds the family's base layer, and points Tailwind at the package's components so their classes are generated with the app's. `dark:` follows the ground (`data-mode` on `<html>`), not the operating system.

The fonts are the app's to load: IBM Plex Sans for the interface, IBM Plex Mono for anything technical, DM Sans for headings. Set `--font-plex-sans`, `--font-plex-mono` and `--font-dm-sans` (with `next/font`, as their `variable`), or install the families under those names.

A non-Tailwind app can import `@calliopelabs/ui/theme.css` alone for the CSS variables.

## Define the product

A product is a brand plus a navigation model. The two consoles' brands ship with the package; each app adds its navigation:

```ts
// lib/product.ts
import { astroliftBrand, defineProduct, type NavModel } from "@calliopelabs/ui";
import { BotIcon, HomeIcon, PackageIcon, RocketIcon } from "lucide-react";

const NAV: NavModel = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
    flat: true,
    groups: [{ functions: [{ key: "home", label: "Home", href: "/dashboard", icon: HomeIcon }] }],
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
            key: "deployments",
            label: "Deployments",
            href: "/deployments",
            icon: RocketIcon,
            requires: "apps",
          },
        ],
      },
    ],
  },
  // agents, admin, ...
];

export const astrolift = defineProduct({ ...astroliftBrand, nav: NAV });
```

Astrolift AI: leaf green on the deep planet green sidebar (`#04231a`), all six grounds, graphite by default (mist when the system runs light), and its eight named themes.

Zentinelle AI: teal (`#37efed`, `#0d7470` on light grounds) on the navy sidebar (`#0b0b19`), a true black ground by default, the family accents beside teal, and no emerald ground. Its seven areas gate rows by role:

```ts
import { defineProduct, zentinelleBrand, type NavModel } from "@calliopelabs/ui";
import { LayoutDashboardIcon, ScaleIcon, ShieldCheckIcon } from "lucide-react";

const NAV: NavModel = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboardIcon,
    flat: true,
    groups: [{ functions: [{ key: "overview", label: "Overview", href: "/dashboard" }] }],
  },
  {
    key: "policies",
    label: "Policies",
    icon: ShieldCheckIcon,
    groups: [{ functions: [{ key: "policies", label: "Policies", href: "/policies" }] }],
  },
  {
    key: "risk",
    label: "Risk & compliance",
    icon: ScaleIcon,
    groups: [
      {
        functions: [
          { key: "risks", label: "Risks", href: "/risks" },
          { key: "evidence", label: "Evidence", href: "/evidence", requires: "admin" },
        ],
      },
    ],
  },
  // agents, activity, models & usage, settings
];

export const zentinelle = defineProduct({ ...zentinelleBrand, nav: NAV });
```

`defineProduct` validates the config and throws on anything that would paint wrong: a colour that is not lowercase `#rrggbb`, a default ground the product does not offer, a brand accent key the family already uses.

## Wire the shell

The example is a Next.js App Router app; any React app works the same way with its own router's link.

The root layout renders the appearance script in `<head>`, so the stored ground, accent, density and corners are on `<html>` before first paint:

```tsx
// app/layout.tsx (a Server Component)
import { AppearanceScript } from "@calliopelabs/ui";

import { astrolift } from "@/lib/product";
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script stamps <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <AppearanceScript product={astrolift} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

The providers live in a client module, because the product holds component references (its navigation icons) that cannot cross from a Server Component into a Client Component as props:

```tsx
// app/providers.tsx
"use client";

import { AppearanceProvider, UIProvider } from "@calliopelabs/ui";
import Link from "next/link";

import { astrolift } from "@/lib/product";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider link={Link}>
      <AppearanceProvider product={astrolift}>{children}</AppearanceProvider>
    </UIProvider>
  );
}
```

The signed-in layout draws the shell. Everything it shows comes from the app; the components are pure:

```tsx
// app/(app)/shell.tsx
"use client";

import {
  AppShell,
  BrandMark,
  RailPanel,
  RailTree,
  Sidebar,
  UserMenu,
  activeFor,
  useRailState,
  visibleNav,
} from "@calliopelabs/ui";
import { usePathname } from "next/navigation";
import * as React from "react";

import { astrolift } from "@/lib/product";

export function Shell({ children, can, projects, me }: ShellProps) {
  const pathname = usePathname() ?? "/";
  const nav = React.useMemo(() => visibleNav(astrolift.nav, can), [can]);
  const [sidebarCollapsed, setSidebarCollapsed] = useRailState("astrolift.shell.main");
  const [railCollapsed, setRailCollapsed] = useRailState(
    "astrolift.shell.projects",
    () => window.innerWidth < 1280
  );

  return (
    <AppShell
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      onToggleRightRail={() => setRailCollapsed(!railCollapsed)}
      sidebar={
        <Sidebar
          nav={nav}
          active={activeFor(nav, pathname)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          header={<BrandMark href="/dashboard" mark={<img src="/logo.svg" alt="" />} />}
          headerCollapsed={
            <BrandMark href="/dashboard" mark={<img src="/logo.svg" alt="" />} collapsed />
          }
          footer={<UserMenu name={me.name} email={me.email} onSignOut={signOut} />}
        />
      }
      rightRail={
        <RailPanel
          label="Projects"
          title={me.orgName}
          collapsed={railCollapsed}
          onCollapsedChange={setRailCollapsed}
        >
          <RailTree
            label="My projects"
            groups={projects}
            activeHref={pathname}
            emptyText="You are not in a project yet."
          />
        </RailPanel>
      }
      rightRailLabel="Projects"
    >
      {children}
    </AppShell>
  );
}
```

`[` folds the sidebar and `]` the right rail. Below `md` both rails open as drawers from a top bar. Zentinelle docks its assistant in the same slot: a `RailPanel` with `collapsedMode="hidden"`, `width` from `useRailWidth(key, 400, { min: 320, max: 560 })` with `onWidthChange`, and `expanded` with `onExpandedChange` for the full-width view. Keep the conversation in state above the shell: on narrow screens a rail renders in its drawer as well as its hidden desktop place.

A page is a `PageFrame`: breadcrumbs from the navigation model (`areaSwitcher`), the title row with its status, context and one primary action, at most one row of tabs, then the body.

```tsx
<PageFrame
  crumbs={[areaSwitcher(nav, "apps", "deployments")]}
  title="Deployments"
  primaryAction={<Button size="sm">New deployment</Button>}
  tabs={views}
  tabsLabel="Views"
>
  <DataTable
    label="Deployments"
    controller={table}
    columns={columns}
    getRowId={(d) => d.id}
    rowHref={(d) => `/deployments/${d.id}`}
    empty={{ title: "No deployments yet", actionHref: "/apps", actionLabel: "Deploy an app" }}
  />
</PageFrame>
```

The package fetches nothing. `DataTable` reads a `TableController`: rows, state, paging, search and sort, all done by the server. An app implements it over its own data layer; Astrolift's `useCursorTable` already returns one.

## Appearance

The person sets four axes, per product: the **ground** (black, charcoal, graphite, emerald, paper, mist; it decides light or dark), the **accent** (the product's own, a family accent, or any colour that stands 3:1 off the ground), the **density** (`compact` hairline rows or boxed `cards`) and the **corners** (0, 2, 4 or 10 px). `AppearancePicker` is the settings UI for all four.

- Precedence: a locked org theme, then the person's choice, then the org default, then the product default. Until someone picks a ground, light or dark follows the system.
- An org policy that arrives after sign-in goes in through `useAppearance().setPolicy`. An app that keeps the preference on its server passes `onChange` and hands the server's copy back through `applyServerAppearance`.
- Status colours never move: lime ok, amber warn, red error, green info, whatever the accent or ground. Tests hold the generated CSS to that, and check WCAG contrast for every ground with every accent.

## Copy and languages

Every string the package renders is English by default and overridable, one group at a time:

```tsx
<UIProvider link={Link} messages={{ table: { retry: t("retry"), loadFailed: (label) => t("loadFailed", { label }) } }}>
```

Messages that take a value are functions, so the app's own i18n formats them. Navigation labels come from the model; `localizeNav(nav, translate)` maps them through a catalog.

## Develop

Node 24 (`.nvmrc`).

| Command                                                     | Does                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run storybook`                                         | The catalog, on port 6006                                                        |
| `npm test`                                                  | Every test, including one that renders every story and runs the a11y addon on it |
| `npm run lint`, `npm run typecheck`, `npm run format:check` | The gates CI runs                                                                |
| `npm run theme`                                             | Regenerates `src/styles/theme.css` after a change to `src/theme/tokens.ts`       |
| `npm run build`, `npm run pack:check`                       | Builds `dist/` and checks the package a consumer receives                        |
| `npm run build-storybook`                                   | The static catalog                                                               |

Conventions for contributors and agents are in [`bootstrap.md`](bootstrap.md).

## Releasing

`publish.yml` publishes to npm as `@calliopelabs/ui` through npm trusted publishing: there is no npm token, the job's GitHub OIDC identity stands in for one, and the package carries provenance. It runs when a GitHub release is published, or by hand on an existing version tag; it refuses a branch. Before anything is published, `release-checks.yml` checks that the tag names the `package.json` version and points at the commit being built, then runs every CI gate on that commit. A prerelease version (`0.2.0-alpha.1`) goes out under the `alpha` dist-tag, and a version already on npm is left alone. Nothing in the workflows bumps a version or creates a tag.

### The first publish

A brand new package cannot use trusted publishing: npm attaches a trusted publisher to a package that already exists. So `0.1.0` is published once by hand, by an npm account in the `calliopelabs` organization with two-factor authentication on. In a fresh clone of `main`, tag it (a tag push starts no workflow) and publish that clean checkout of the tag:

```sh
git clone https://github.com/calliopeai/calliope-ui.git calliope-ui-v0.1.0 && cd calliope-ui-v0.1.0
git tag v0.1.0 && git push origin v0.1.0
nvm use
npm login
npm ci && npm run build && npm publish --access public
```

Then add the trusted publisher on npmjs.com, in the package's settings under Trusted publishing: GitHub Actions, organization or user `calliopeai`, repository `calliope-ui`, workflow filename `publish.yml`, no environment. Under allowed actions, allow `npm publish`: a configuration created after 2026-09-03 allows only staged publishing (`npm stage publish`) by default, and this workflow publishes directly. The same from the command line (npm 11.15 or later):

```sh
npm trust github @calliopelabs/ui --repo calliopeai/calliope-ui --file publish.yml --allow-publish
```

A new trusted publisher expires unless a publish through it succeeds within 2 days, so add it shortly before the next release; if it expired, delete it and add it again. From then on, a published GitHub release publishes automatically. Once a release has gone out that way, setting Publishing access to "Require two-factor authentication and disallow tokens" turns token publishing off.

### Every release after

Bump the version in a pull request (`npm version 0.2.0 --no-git-tag-version` changes `package.json` and `package-lock.json`). Once it merges, publish a release whose tag names that version:

```sh
gh release create v0.2.0 --target main --generate-notes
```

Add `--prerelease` for a prerelease version. A failed run can be re-run, or dispatched again on the tag with `gh workflow run publish.yml --ref v0.2.0`.

## Licence

MIT. See [LICENSE](LICENSE).
