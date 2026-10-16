# @calliopeai/ui bootstrap

The conventions document for this package. The agent shims (`CLAUDE.md`, `AGENTS.md`) point here. An agent given this document and a UI requirement should be able to add or change a component correctly without exploring the codebase.

## What it is

The shared operator UI of Calliope AI, consumed by Astrolift AI (`calliopeai/astrolift-app`, `frontend/`) and Zentinelle AI (`calliopeai/zentinelle`, `frontend/`). Extracted from the Astrolift frontend at origin/main 8edb40d and generalized with a per-product config. The Astrolift design rules for app surfaces (the operator-UI amendment of 2026-08-21) are the law here: neutral grounds, the sidebar as the one brand surface, 2px corners, a selectable accent, semantic status that never varies, light grounds paper and mist, density as a real axis.

## Stack

| Concern         | Choice                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library         | React 19, TypeScript 6 (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`)                                                                               |
| Build           | `tsc -p tsconfig.build.json`, per-file ESM plus declarations into `dist/` (`scripts/build.mjs`)                                                                   |
| Styling         | Tailwind CSS 4 utilities on the package's tokens; `src/styles/preset.css` is the consumer's preset                                                                |
| Primitives      | `radix-ui` (Dialog, AlertDialog, DropdownMenu, Popover, Checkbox, Tabs, Slot), `lucide-react` icons, `class-variance-authority`, `clsx` + `tailwind-merge` (`cn`) |
| Catalog         | Storybook 10 (`@storybook/react-vite`) with `@storybook/addon-a11y`                                                                                               |
| Tests           | Vitest 5, jsdom, Testing Library, the a11y addon through portable stories                                                                                         |
| Lint and format | ESLint 9 (typescript-eslint, react-hooks 7, jsx-a11y, storybook) and Prettier with the Tailwind plugin                                                            |

## Layout

```
src/
  index.ts            the public API: everything exported from here, nothing else
  theme/              tokens.ts (the palette, the single source), css.ts (generates theme.css), contrast.ts
  styles/             theme.css (generated, never edit), preset.css (the Tailwind 4 preset)
  appearance/         product.ts (defineProduct), brands.ts, appearance.ts (pure resolution and storage),
                      boot.ts (the pre-paint script), AppearanceProvider, AppearanceScript, AppearancePicker
  provider/           UIProvider (the app's link and copy), messages.ts (every string, English)
  nav/                model.ts (types and pure functions), Nav.tsx
  shell/              AppShell, Sidebar, RailPanel, RailTree, BrandMark, UserMenu, rail-state.ts
  page/               PageFrame, PageHeader, Breadcrumbs, TabNav, Section
  data/               DataTable, List and ListItem, types.ts (TableController), use-row-selection.ts
  status/             StatusBadge, StatusDot, tones.ts (the one status colour map)
  states/             EmptyState, ErrorState, LoadingState
  overlays/           Dialog, Drawer, ConfirmDialog
  primitives/         Button, Input, Checkbox, DropdownMenu, Popover, Tabs, Skeleton
  lib/                cn.ts, local-store.ts (localStorage as an external store)
  examples/           the Astrolift and Zentinelle shells, whole (catalog only, not shipped)
  test/               setup.ts, the story-coverage test and the every-story-renders test
.storybook/           main.ts, preview.tsx (providers and appearance toolbars), storybook.css
scripts/              build.mjs, check-package.mjs, generate-theme.ts
```

## Rules

- **Storybook first.** Every `.tsx` under `src/` that defines a component (`export function Name`) has a sibling `.stories.tsx`, and every component exported from `src/index.ts` is imported by a story. `src/test/story-coverage.test.ts` enforces both, with no allowlist. Stories cover the states: loading, empty, error, full, long strings, 768px wide, where they apply.
- **Every story renders and passes a11y.** `src/test/stories.test.tsx` mounts each story through the catalog decorator; the a11y addon fails it on any WCAG A or AA violation. Colour contrast needs real CSS, so it is held by `src/theme/contrast.test.ts` on the token values and checked in a browser before a release.
- **Tokens, not values.** Class strings use tokens; the `calliope/design-tokens` lint rule rejects raw hex, rgb, hsl, oklch, Tailwind palette colours, `text-[Npx]`, `rounded-[Npx]` and arbitrary px or rem spacing. A swatch that must show an exact colour sets it through `style`. `rounded-lg` is the corners setting; pills, dots and avatars are `rounded-full`.
- **The palette has one source.** Edit `src/theme/tokens.ts`, then `npm run theme`. `src/theme/theme-css.test.ts` fails when the committed CSS and the generator disagree, when a ground, accent or density block touches a status token, or when an accent block sets anything but the accent and its displaced chart series.
- **Status never varies.** Map an app's states onto the five tones (`ok`, `warn`, `error`, `info`, `muted`) and render them with `StatusBadge` or `StatusDot`. Never colour status with `primary` or a chart token. In-flight states pulse the dot, never the label.
- **No Next-only APIs.** `next` and `next/*` are banned by lint everywhere in `src/`. Links go through `useUI().Link`; anything a route would supply comes in as props.
- **Radix is wrapped once.** Only `src/primitives/` and `src/overlays/` import `radix-ui`; everything else composes the wrappers.
- **Plain ESM.** Relative imports end in `.js` (`calliope/relative-import-extension`). A file that uses hooks, context or browser APIs starts with `"use client"`; pure modules (the nav model, appearance functions, tokens, `AppearanceScript`) do not, so a Server Component can import them. `npm run pack:check` verifies both.
- **Copy is overridable.** Every rendered string comes from `useUI().messages` (`src/provider/messages.ts`), with an English default. A string that takes a value is a function.
- **Lists are the server's.** `DataTable` reads a `TableController` and never pages, sorts or searches on the client. `empty` and `emptyFiltered` are different states. Rows that navigate are links (`rowHref`); rows that act are named buttons (`onRowActivate` with `rowLabel`). Destructive actions confirm with `ConfirmDialog`.
- **Density is CSS.** Lists switch layout through the variables `data-density` sets (`--list-columns`, `--list-item-*`, `--row-pad-*`), so the first paint is already right and a subtree can override the page.
- **No flash.** `AppearanceScript` stamps `<html>` before paint; `AppearanceProvider` reads storage as an external store and does not stamp while hydrating. `src/appearance/boot.test.ts` holds the script and the TypeScript resolution to the same answer; `AppearanceProvider.test.tsx` proves hydration never repaints the default.
- **Accessible names are spoken text.** Adjacent spans join with no separator in an accessible name; put `{" "}` between them. A control with visible text is named by that text (no `aria-label` that hides it).

## Adding a component

1. Write it under the right folder, `"use client"` if it needs it, with props for everything it shows and callbacks for everything it does. Copy from `useUI().messages`, links from `useUI().Link`.
2. Write its `.stories.tsx` beside it: every state, a long-strings story, a narrow one. Review it with `npm run storybook` under both products and a light ground.
3. Export it from `src/index.ts`.
4. Write a `.test.tsx` for its behaviour: roles and names, keyboard, the states, the callbacks.
5. Run `npm run lint`, `npm run typecheck` and `npm test`.

## Tests

All tests are the always tier: fast, deterministic, no network. Vitest runs without globals, so `src/test/setup.ts` registers Testing Library cleanup, stubs the browser APIs Radix needs (ResizeObserver, scrollIntoView, pointer capture), gives a memory localStorage, and stops jsdom from trying to follow links. Vitest's persistent module cache is off: it kept `import.meta.glob` results across runs, which would let a new story file go untested.

## Commands

| Command                                       | Does                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `npm run storybook`                           | The catalog on port 6006                                                               |
| `npm test`                                    | Every test                                                                             |
| `npm run test:story-coverage`                 | The story-coverage holds alone                                                         |
| `npm run lint` / `typecheck` / `format:check` | The other gates                                                                        |
| `npm run theme`                               | Regenerate `theme.css`                                                                 |
| `npm run build` / `pack:check`                | Build `dist/`, then check the tarball, the entry, the client boundaries and the preset |
| `npm run build-storybook`                     | The static catalog                                                                     |

## CI and release

- `ci.yml`, on ready pull requests (drafts skip, superseded runs cancel, npm cache): format, lint, typecheck, story coverage, tests, package build and check, Storybook build, in one job. A change that is only top-level Markdown runs the format check alone.
- `storybook.yml`, on merges to `main` that touch the package: the tests again, then the catalog to GitHub Pages.
- `release.yml`, on a `v*` tag: checks the tag names `package.json`'s version, runs every gate, packs once, and publishes that tarball to npm with provenance (`NPM_TOKEN`) and to GitHub Packages (`GITHUB_TOKEN`). A registry whose token is missing is skipped with a warning; a version already published is left alone.

Git: no rebases, no force pushes, no AI attribution in commits. Commit as Leo Mata <leo@calliope.ai>.
