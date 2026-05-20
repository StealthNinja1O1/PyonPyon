import { layouts, type LayoutName } from "../../pyon/src/layouts/index.ts";

/**
 * Returns all available layout style names from Pyon's layout registry.
 * Dynamically reads `Object.keys(layouts)`, so new layouts added to Pyon are picked up automatically.
 */
export function getAvailableStyles(): LayoutName[] {
  return Object.keys(layouts) as LayoutName[];
}

export type { LayoutName };
