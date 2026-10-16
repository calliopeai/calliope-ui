"use client";

import * as React from "react";

/**
 * Where a rail is drawn: inline beside the content, or inside the drawer the
 * shell opens on narrow screens. In a drawer a rail fills it, ignores its
 * collapsed state and width, and hides the controls that only make sense
 * beside the content.
 */
export type RailPlacement = "inline" | "drawer";

export const RailPlacementContext = React.createContext<RailPlacement>("inline");

export function useRailPlacement(): RailPlacement {
  return React.useContext(RailPlacementContext);
}
