# Claude: @calliopeai/ui

Primary conventions doc: [`bootstrap.md`](bootstrap.md). Read it before writing any code.

## Project-specific notes

- React 19 component library for Astrolift AI and Zentinelle AI; Tailwind CSS 4 tokens and preset; Storybook 10 catalog.
- Storybook first: a component file without a sibling story, or an export no story imports, fails `npm test`.
- Tokens come from `src/theme/tokens.ts`; run `npm run theme` after editing it. Never edit `src/styles/theme.css` by hand.
- Node 24 (`.nvmrc`). Gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build-storybook`, `npm run build && npm run pack:check`.
- No Next-only imports anywhere in `src/`; links come from `useUI().Link`.
- Voice in docs and copy: no em-dashes; "Calliope AI", never the bare name.
