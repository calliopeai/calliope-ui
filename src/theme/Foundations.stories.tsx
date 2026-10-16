import type { Meta, StoryObj } from "@storybook/react-vite";

import { astrolift, zentinelle } from "../examples/products.js";
import { StatusBadge } from "../status/StatusBadge.js";
import { STATUS_TONES } from "../status/tones.js";
import { contrastRatio } from "./contrast.js";
import {
  ACCENTS,
  ACCENT_KEYS,
  DENSITIES,
  GROUNDS,
  GROUND_KEYS,
  MODE_TOKENS,
  SURFACES,
} from "./tokens.js";

/**
 * The family palette, straight from the token table that generates
 * theme.css: every ground with every accent, the semantic status colours,
 * the type scale, corners and density. Ratios are WCAG contrast against the
 * ground.
 */
const meta = { title: "Foundations/Tokens" } satisfies Meta;
export default meta;

function Swatch({ name, color, on }: { name: string; color: string; on?: string }) {
  const ratio = on && color.startsWith("#") ? contrastRatio(color, on).toFixed(1) : null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden
        className="size-6 shrink-0 rounded-lg border"
        style={{ background: color }}
      />
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">{name}</span>
        <span className="block font-mono text-2xs text-muted-foreground">
          {color}
          {ratio && ` · ${ratio}:1`}
        </span>
      </span>
    </div>
  );
}

export const Grounds: StoryObj = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {GROUND_KEYS.map((ground) => {
        const s = SURFACES[ground];
        const mode = GROUNDS[ground].mode;
        return (
          <section
            key={ground}
            aria-label={GROUNDS[ground].label}
            className="flex flex-col gap-3 rounded-lg border p-3"
          >
            <h2 className="text-sm font-semibold">
              {GROUNDS[ground].label}{" "}
              <span className="font-normal text-muted-foreground">({mode})</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Swatch name="background" color={s.background} />
              <Swatch name="card" color={s.card} />
              <Swatch name="popover" color={s.popover} />
              <Swatch name="muted text" color={s.mutedForeground} on={s.background} />
              <Swatch name="foreground" color={MODE_TOKENS[mode].foreground} on={s.background} />
              {s.sidebar === "brand" ? (
                <>
                  <Swatch name="sidebar, Astrolift AI" color={astrolift.sidebar} />
                  <Swatch name="sidebar, Zentinelle AI" color={zentinelle.sidebar} />
                </>
              ) : (
                <Swatch name="sidebar (neutral)" color={s.sidebar} />
              )}
            </div>
          </section>
        );
      })}
    </div>
  ),
};

export const Accents: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[
        ...ACCENT_KEYS.map((key) => ({ key, ...ACCENTS[key] })),
        { ...zentinelle.brandAccent! },
      ].map((accent) => (
        <section key={accent.key} aria-label={accent.label} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">
            {accent.label}
            {accent.key === "teal" && (
              <span className="font-normal text-muted-foreground"> (Zentinelle AI)</span>
            )}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {GROUND_KEYS.map((ground) => {
              const dark = GROUNDS[ground].mode === "dark";
              return (
                <Swatch
                  key={ground}
                  name={`on ${GROUNDS[ground].label.toLowerCase()}`}
                  color={dark ? accent.dark : accent.light}
                  on={SURFACES[ground].background}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  ),
};

/** Status never moves with the accent: change it in the toolbar and watch these stay put. */
export const Status: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_TONES.map((tone) => (
          <StatusBadge key={tone} tone={tone}>
            {tone}
          </StatusBadge>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(["dark", "light"] as const).flatMap((mode) =>
          (["success", "warning", "info", "danger"] as const).map((name) => (
            <Swatch
              key={`${mode}-${name}`}
              name={`${name} (${mode})`}
              color={MODE_TOKENS[mode].status[name].base}
            />
          ))
        )}
      </div>
    </div>
  ),
};

export const Type: StoryObj = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-2xl font-semibold">DM Sans for headings</h1>
      <p className="text-sm">IBM Plex Sans carries the interface: body, labels, controls.</p>
      <p className="font-mono text-sm">
        IBM Plex Mono for anything technical: 7f3c2a91 · us-west-2 · v1.12.0
      </p>
      <div className="flex flex-col gap-1">
        {(
          ["text-2xs", "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"] as const
        ).map((size) => (
          <p key={size} className={size}>
            <span className="font-mono text-muted-foreground">{size}</span> Deploy checkout to
            production
          </p>
        ))}
      </div>
    </div>
  ),
};

/** `rounded-lg` is the corners setting; pills and avatars stay round. */
export const Corners: StoryObj = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <div className="size-16 rounded-lg border bg-card" />
      <div className="h-8 w-28 rounded-lg bg-primary" />
      <StatusBadge tone="ok">pill</StatusBadge>
      <div className="size-8 rounded-full bg-muted" />
    </div>
  ),
};

export const Density: StoryObj = {
  render: () => (
    <table className="max-w-xl text-left font-mono text-xs">
      <caption className="pb-2 text-left font-sans text-sm text-muted-foreground">
        The variables each density sets; any element may carry its own data-density.
      </caption>
      <thead>
        <tr className="text-muted-foreground">
          <th scope="col" className="pr-6 font-medium">
            token
          </th>
          <th scope="col" className="pr-6 font-medium">
            {DENSITIES.compact.label}
          </th>
          <th scope="col" className="font-medium">
            {DENSITIES.cards.label}
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(DENSITIES.compact.tokens).map((token) => (
          <tr key={token}>
            <th scope="row" className="pr-6 font-normal">
              --{token}
            </th>
            <td className="pr-6">{DENSITIES.compact.tokens[token]}</td>
            <td>{DENSITIES.cards.tokens[token]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
