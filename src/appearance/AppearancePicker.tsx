"use client";

import { LockIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn.js";
import { Button } from "../primitives/Button.js";
import { useUI } from "../provider/UIProvider.js";
import { MIN_NON_TEXT_CONTRAST } from "../theme/contrast.js";
import { DENSITY_KEYS, GROUNDS, SURFACES, type Ground } from "../theme/tokens.js";
import {
  type CustomAccent,
  accentContrast,
  isCustomAccent,
  modeFor,
  parseCustomAccent,
} from "./appearance.js";
import { useAppearance } from "./AppearanceProvider.js";
import { CORNERS, type Product, type ProductAccent } from "./product.js";

/** The sidebar a ground paints for this product, for the theme previews. */
function sidebarFor(product: Product, ground: Ground): string {
  const sidebar = SURFACES[ground].sidebar;
  return sidebar === "brand" ? product.sidebar : sidebar;
}

function accentOn(accent: ProductAccent | undefined, ground: Ground): string {
  if (!accent) return "transparent";
  return modeFor(ground) === "dark" ? accent.dark : accent.light;
}

/** A miniature of the chrome: sidebar, ground and accent, in the exact colours. */
function ThemePreview({
  product,
  ground,
  accent,
}: {
  product: Product;
  ground: Ground;
  accent: ProductAccent | undefined;
}) {
  return (
    <span
      aria-hidden
      className="flex h-9 overflow-hidden rounded-lg border"
      style={{ background: SURFACES[ground].background }}
    >
      <span style={{ background: sidebarFor(product, ground), width: "26%" }} />
      <span className="flex flex-1 items-center px-1.5">
        <span
          style={{ background: accentOn(accent, ground), height: 4, width: "58%", borderRadius: 1 }}
        />
      </span>
    </span>
  );
}

const choice =
  "relative flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:border-primary has-checked:border-primary has-checked:ring-1 has-checked:ring-primary has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:ring-2 has-focus-visible:ring-ring";

function Choice({
  name,
  checked,
  disabled,
  onSelect,
  className,
  children,
}: {
  name: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn(choice, className)}>
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
    </label>
  );
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-2xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * The person's appearance for the product in context: theme presets, accent
 * (including any colour that stands 3:1 off the ground), ground, density and
 * corners. Read-only while the org locks the theme. Choosing a ground also
 * chooses light or dark. Status colours are not offered: they never change.
 */
export function AppearancePicker({ className }: { className?: string }) {
  const { product, appearance, locked, setAppearance, reset } = useAppearance();
  const { messages } = useUI();
  const t = messages.appearance;
  const id = React.useId();
  const accents = product.accents;
  const activeTheme = product.themes.find(
    (th) => th.ground === appearance.ground && th.accent === appearance.accent
  );

  return (
    <div data-slot="appearance-picker" className={cn("flex min-w-0 flex-col gap-6", className)}>
      {locked && (
        <p className="flex items-center gap-2 rounded-lg border border-info-border bg-info-bg px-3 py-2 text-sm text-info-fg">
          <LockIcon className="size-4 shrink-0" aria-hidden />
          {t.locked}
        </p>
      )}

      {product.themes.length > 0 && (
        <Group legend={t.themes}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2">
            {product.themes.map((theme) => (
              <Choice
                key={theme.id}
                name={`${id}-theme`}
                checked={activeTheme?.id === theme.id}
                disabled={locked}
                onSelect={() => setAppearance({ ground: theme.ground, accent: theme.accent })}
                className="flex-col items-stretch gap-2 p-2"
              >
                <ThemePreview
                  product={product}
                  ground={theme.ground}
                  accent={accents.find((a) => a.key === theme.accent)}
                />
                <span>
                  <span className="block text-sm font-semibold">{theme.name}</span>
                  <span className="block text-xs text-muted-foreground">{theme.hint}</span>
                </span>
              </Choice>
            ))}
          </div>
        </Group>
      )}

      <Group legend={t.accent}>
        <div className="flex flex-wrap gap-2">
          {accents.map((accent) => (
            <Choice
              key={accent.key}
              name={`${id}-accent`}
              checked={appearance.accent === accent.key}
              disabled={locked}
              onSelect={() => setAppearance({ accent: accent.key })}
            >
              <span
                aria-hidden
                className="size-3.5 rounded-full"
                style={{ background: accentOn(accent, appearance.ground) }}
              />
              {t.accentLabel(accent.key, accent.label)}
            </Choice>
          ))}
        </div>
        <CustomAccent
          id={`${id}-custom`}
          value={isCustomAccent(appearance.accent) ? appearance.accent : null}
          ground={appearance.ground}
          disabled={locked}
          onChange={(accent) => setAppearance({ accent })}
        />
      </Group>

      <Group legend={t.ground}>
        <div className="flex flex-wrap gap-2">
          {product.grounds.map((ground) => (
            <Choice
              key={ground}
              name={`${id}-ground`}
              checked={appearance.ground === ground}
              disabled={locked}
              onSelect={() => setAppearance({ ground })}
            >
              <span
                aria-hidden
                className="size-3.5 rounded-full border"
                style={{ background: SURFACES[ground].background }}
              />
              {t.groundLabel(ground, GROUNDS[ground].label)}
              <span className="text-xs text-muted-foreground">{t.mode(GROUNDS[ground].mode)}</span>
            </Choice>
          ))}
        </div>
      </Group>

      <Group legend={t.density}>
        <div className="grid gap-2 sm:grid-cols-2">
          {DENSITY_KEYS.map((density) => (
            <Choice
              key={density}
              name={`${id}-density`}
              checked={appearance.density === density}
              disabled={locked}
              onSelect={() => setAppearance({ density })}
              className="flex-col items-start gap-0.5 px-3 py-2"
            >
              <span className="text-sm font-semibold">{t.densityLabel(density)}</span>
              <span className="text-xs text-muted-foreground">{t.densityHint(density)}</span>
            </Choice>
          ))}
        </div>
      </Group>

      <Group legend={t.corners}>
        <div className="flex flex-wrap gap-2">
          {CORNERS.map((corners) => (
            <Choice
              key={corners}
              name={`${id}-corners`}
              checked={appearance.corners === corners}
              disabled={locked}
              onSelect={() => setAppearance({ corners })}
            >
              <span
                aria-hidden
                className="size-3.5 border-t-2 border-l-2 border-current"
                style={{ borderTopLeftRadius: corners }}
              />
              {t.cornersLabel(corners)}
            </Choice>
          ))}
        </div>
      </Group>

      {!locked && (
        <div>
          <Button variant="outline" size="sm" onClick={reset}>
            {t.reset}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Any colour as the accent (Astrolift palette option A). It applies only once
 * it stands 3:1 off the ground (WCAG 2.2 §1.4.11); until then the draft stays
 * in the field with the reason.
 */
function CustomAccent({
  id,
  value,
  ground,
  disabled,
  onChange,
}: {
  id: string;
  value: CustomAccent | null;
  ground: Ground;
  disabled: boolean;
  onChange: (accent: CustomAccent) => void;
}) {
  const { messages } = useUI();
  const t = messages.appearance;
  const [draft, setDraft] = React.useState(value ?? "");
  const parsed = parseCustomAccent(draft);
  const check = parsed ? accentContrast(parsed, ground) : null;
  const helpId = `${id}-help`;

  function update(next: string) {
    setDraft(next);
    const hex = parseCustomAccent(next);
    if (hex && accentContrast(hex, ground).ok) onChange(hex);
  }

  const help = !draft
    ? t.customAccentHelp
    : !parsed
      ? t.customAccentInvalid
      : check?.ok
        ? t.customAccentOk(check.ratio.toFixed(1))
        : t.customAccentFaint(
            (check?.ratio ?? 1).toFixed(1),
            MIN_NON_TEXT_CONTRAST,
            modeFor(ground)
          );

  return (
    <div className="mt-1 flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {t.customAccent}
      </label>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <input
          type="color"
          aria-label={t.customAccentPick}
          disabled={disabled}
          value={parsed ?? "#2f9e52"}
          onChange={(event) => update(event.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-lg border bg-transparent disabled:cursor-not-allowed"
        />
        <input
          id={id}
          type="text"
          inputMode="text"
          spellCheck={false}
          disabled={disabled}
          value={draft}
          placeholder="#2f9e52"
          onChange={(event) => update(event.target.value)}
          aria-invalid={Boolean(draft) && !check?.ok}
          aria-describedby={helpId}
          className="h-8 w-32 rounded-lg border border-input bg-transparent px-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
        />
        {value && <span className="text-xs text-muted-foreground">{t.customAccentInUse}</span>}
      </div>
      <p
        id={helpId}
        aria-live="polite"
        className={cn(
          "text-xs [overflow-wrap:anywhere]",
          draft && !check?.ok ? "text-danger-fg" : "text-muted-foreground"
        )}
      >
        {help}
      </p>
    </div>
  );
}
