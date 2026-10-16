/**
 * Every string the package renders, in English. An app with a message
 * catalog overrides any of them through `UIProvider messages={...}`; a
 * message that takes a value is a function, so the app's own i18n formats
 * it (plurals, numbers, word order).
 */
export interface Messages {
  shell: {
    skipToContent: string;
    /** The mobile button and drawer title for the sidebar. */
    navigation: string;
    close: string;
  };
  nav: {
    /** The sidebar's landmark name. */
    label: string;
    collapse: string;
    expand: string;
    collapseTitle: string;
    expandTitle: string;
  };
  rail: {
    show: (label: string) => string;
    hide: (label: string) => string;
    resize: (label: string) => string;
    expand: (label: string) => string;
    restore: (label: string) => string;
  };
  breadcrumb: {
    label: string;
    switchFrom: (label: string) => string;
  };
  table: {
    search: string;
    clearSearch: string;
    results: (count: number) => string;
    loading: string;
    loadFailed: (label: string) => string;
    requestFailed: string;
    retry: string;
    noMatches: string;
    noMatchesDescription: (label: string) => string;
    selected: (count: number) => string;
    clearSelection: string;
    selectRow: (id: string) => string;
    selectPage: (label: string) => string;
    actions: string;
    rowActions: (label: string) => string;
    rowsPerPage: string;
    page: (page: number) => string;
    previousPage: string;
    nextPage: string;
    sortKey: (index: number) => string;
  };
  states: {
    errorTitle: string;
    unexpected: string;
    retry: string;
    errorId: (digest: string) => string;
    loading: string;
    learnMore: string;
  };
  dialog: {
    close: string;
  };
  confirm: {
    confirm: string;
    cancel: string;
    working: string;
    failed: string;
    reasonRequired: string;
  };
  user: {
    accountMenu: (name: string) => string;
    signOut: string;
  };
  appearance: {
    locked: string;
    themes: string;
    accent: string;
    ground: string;
    density: string;
    corners: string;
    reset: string;
    mode: (mode: "dark" | "light") => string;
    groundLabel: (ground: string, label: string) => string;
    accentLabel: (accent: string, label: string) => string;
    densityLabel: (density: "compact" | "cards") => string;
    densityHint: (density: "compact" | "cards") => string;
    cornersLabel: (corners: number) => string;
    customAccent: string;
    customAccentPick: string;
    customAccentHelp: string;
    customAccentInvalid: string;
    customAccentInUse: string;
    customAccentOk: (ratio: string) => string;
    customAccentFaint: (ratio: string, min: number, mode: "dark" | "light") => string;
  };
}

const lower = (label: string) => label.toLocaleLowerCase("en");
const count = (n: number) => n.toLocaleString("en");

export const defaultMessages: Messages = {
  shell: {
    skipToContent: "Skip to content",
    navigation: "Navigation",
    close: "Close",
  },
  nav: {
    label: "Main",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    collapseTitle: "Collapse sidebar ([)",
    expandTitle: "Expand sidebar ([)",
  },
  rail: {
    show: (label) => `Show ${lower(label)}`,
    hide: (label) => `Hide ${lower(label)}`,
    resize: (label) => `Resize ${lower(label)}`,
    expand: (label) => `Expand ${lower(label)} to full width`,
    restore: (label) => `Restore ${lower(label)} to the side`,
  },
  breadcrumb: {
    label: "Breadcrumb",
    switchFrom: (label) => `Switch from ${label}`,
  },
  table: {
    search: "Search",
    clearSearch: "Clear search",
    results: (n) => (n === 1 ? "1 result" : `${count(n)} results`),
    loading: "Loading",
    loadFailed: (label) => `Could not load ${lower(label)}`,
    requestFailed: "The request failed.",
    retry: "Retry",
    noMatches: "No matches",
    noMatchesDescription: (label) => `No ${lower(label)} match the search.`,
    selected: (n) => `${count(n)} selected`,
    clearSelection: "Clear",
    selectRow: (id) => `Select ${id}`,
    selectPage: (label) => `Select all ${lower(label)} on this page`,
    actions: "Actions",
    rowActions: (label) => `Actions for ${label}`,
    rowsPerPage: "Rows per page",
    page: (n) => `Page ${count(n)}`,
    previousPage: "Previous page",
    nextPage: "Next page",
    sortKey: (index) => `sort key ${index}`,
  },
  states: {
    errorTitle: "Something went wrong",
    unexpected: "An unexpected error occurred.",
    retry: "Try again",
    errorId: (digest) => `Error ID ${digest}`,
    loading: "Loading",
    learnMore: "Learn more",
  },
  dialog: {
    close: "Close",
  },
  confirm: {
    confirm: "Confirm",
    cancel: "Cancel",
    working: "Working",
    failed: "That did not work. Try again.",
    reasonRequired: "A reason is required.",
  },
  user: {
    accountMenu: (name) => `Account menu for ${name}`,
    signOut: "Sign out",
  },
  appearance: {
    locked: "Your organization has locked the theme. These settings are read-only.",
    themes: "Theme",
    accent: "Accent",
    ground: "Ground",
    density: "Density",
    corners: "Corners",
    reset: "Use the default",
    mode: (mode) => mode,
    groundLabel: (_ground, label) => label,
    accentLabel: (_accent, label) => label,
    densityLabel: (density) => (density === "compact" ? "Compact" : "Cards"),
    densityHint: (density) =>
      density === "compact"
        ? "Dense rows with hairline dividers"
        : "Boxed items that flow into columns",
    cornersLabel: (corners) =>
      corners === 0 ? "Square" : corners === 10 ? "Rounded" : `${corners}px`,
    customAccent: "Custom accent",
    customAccentPick: "Pick a colour",
    customAccentHelp: "Any colour that stands 3:1 off the ground. Status colours never change.",
    customAccentInvalid: "Use a hex colour such as #2f9e52.",
    customAccentInUse: "In use",
    customAccentOk: (ratio) => `${ratio}:1 against this ground.`,
    customAccentFaint: (ratio, min, mode) =>
      `${ratio}:1 against this ground; it needs ${min}:1. Try a ${mode === "dark" ? "lighter" : "darker"} colour.`,
  },
};

/** Any subset of the messages, one level deep. */
export type MessageOverrides = { [Group in keyof Messages]?: Partial<Messages[Group]> };

export function mergeMessages(overrides: MessageOverrides | undefined): Messages {
  if (!overrides) return defaultMessages;
  const merged = { ...defaultMessages } as Record<keyof Messages, unknown>;
  for (const group of Object.keys(overrides) as (keyof Messages)[]) {
    merged[group] = { ...defaultMessages[group], ...overrides[group] };
  }
  return merged as Messages;
}
