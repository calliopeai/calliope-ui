/**
 * localStorage as a React external store, for per-person display
 * preferences (appearance, rail state). Reads and writes never throw: Safari
 * private mode and embedded webviews throw on storage access. A write that
 * storage refuses is held for the rest of the page, so the choice still
 * applies until reload.
 */

/** Dispatched on window after every write in this tab; other tabs hear `storage`. */
export const LOCAL_STORE_EVENT = "calliope-ui:storage";

const unsaved = new Map<string, string | null>();

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readLocal(key: string): string | null {
  if (unsaved.has(key)) return unsaved.get(key) ?? null;
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null): void {
  try {
    const s = storage();
    if (!s) throw new Error("storage unavailable");
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
    unsaved.delete(key);
  } catch {
    unsaved.set(key, value);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCAL_STORE_EVENT, { detail: key }));
  }
}

export function subscribeLocal(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_STORE_EVENT, onChange);
  };
}
