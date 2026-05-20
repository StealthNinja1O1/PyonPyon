/**
 * Accent color palette for quote cards.
 * The "default" entry maps to Pyon's pink (#ff5fa2).
 */
export interface ColorOption {
  id: string;
  label: string;
  hex: string | undefined; // undefined = let Pyon use its default
}

export const COLOR_PALETTE: readonly ColorOption[] = [
  { id: "default", label: "Default Pink", hex: undefined },
  { id: "coral", label: "Coral", hex: "#ff6b6b" },
  { id: "lavender", label: "Lavender", hex: "#9b7fd4" },
  { id: "sky", label: "Sky Blue", hex: "#5b9bd5" },
  { id: "mint", label: "Mint", hex: "#4ecdc4" },
  { id: "gold", label: "Gold", hex: "#f9a825" },
  { id: "sunset", label: "Sunset", hex: "#ff8a65" },
  { id: "rose", label: "Rose", hex: "#e91e63" },
  { id: "teal", label: "Teal", hex: "#26a69a" },
  { id: "slate", label: "Slate", hex: "#607d8b" },
] as const;

export function getColorHex(id: string): string | undefined {
  return COLOR_PALETTE.find((c) => c.id === id)?.hex;
}

export function getColorId(hex: string | undefined): string {
  if (!hex) return "default";
  return COLOR_PALETTE.find((c) => c.hex === hex)?.id ?? "default";
}
