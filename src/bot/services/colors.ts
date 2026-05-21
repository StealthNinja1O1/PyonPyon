export interface ColorOption {
  id: string;
  label: string;
  hex: string | undefined; // undefined = let Pyon use its default
}

// --- Accent color (decorative highlights) ---
export const ACCENT_PALETTE: readonly ColorOption[] = [
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

// --- Background color ---
export const BG_PALETTE: readonly ColorOption[] = [
  { id: "default", label: "Dark (default)", hex: undefined },
  { id: "midnight", label: "Midnight", hex: "#0a0a1a" },
  { id: "charcoal", label: "Charcoal", hex: "#1a1a2e" },
  { id: "navy", label: "Navy", hex: "#0d1b2a" },
  { id: "forest", label: "Forest", hex: "#0a1a0a" },
  { id: "wine", label: "Wine", hex: "#1a0a14" },
  { id: "slate-dark", label: "Slate", hex: "#1e2a3a" },
  { id: "warm-dark", label: "Warm Dark", hex: "#1a1410" },
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "cream", label: "Cream", hex: "#f5f0e8" },
] as const;

// --- Text color ---
export const TEXT_PALETTE: readonly ColorOption[] = [
  { id: "default", label: "Light (default)", hex: undefined },
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "snow", label: "Snow", hex: "#f0f0f4" },
  { id: "warm-white", label: "Warm White", hex: "#f5efe6" },
  { id: "black", label: "Black", hex: "#000000" },
  { id: "dark-gray", label: "Dark Gray", hex: "#2a2a2e" },
  { id: "soft-gray", label: "Soft Gray", hex: "#8a8a96" },
  { id: "gold-text", label: "Gold", hex: "#d4a84b" },
  { id: "silver", label: "Silver", hex: "#b8c0cc" },
] as const;

function findHex(palette: readonly ColorOption[], id: string): string | undefined {
  return palette.find((c) => c.id === id)?.hex;
}

export const getAccentHex = (id: string) => findHex(ACCENT_PALETTE, id);
export const getBgHex = (id: string) => findHex(BG_PALETTE, id);
export const getTextHex = (id: string) => findHex(TEXT_PALETTE, id);

// Keep backward compat for existing imports
export const getColorHex = getAccentHex;
export const COLOR_PALETTE = ACCENT_PALETTE;
