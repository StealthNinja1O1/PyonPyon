import { MessageComponentTypes, ButtonStyles } from "@discordeno/bot";
import { ACCENT_PALETTE, BG_PALETTE, TEXT_PALETTE, type ColorOption } from "./colors.ts";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildStyleSelect(
  currentStyle: string,
  availableStyles: string[],
) {
  return {
    type: MessageComponentTypes.ActionRow as const,
    components: [
      {
        type: MessageComponentTypes.SelectMenu as const,
        customId: "pyon:style",
        placeholder: "Style",
        options: availableStyles.map((style) => ({
          label: capitalize(style),
          value: style,
          default: style === currentStyle,
        })),
      },
    ],
  };
}

export function buildAccentSelect(
  currentId: string,
) {
  return {
    type: MessageComponentTypes.ActionRow as const,
    components: [
      {
        type: MessageComponentTypes.SelectMenu as const,
        customId: "pyon:accent",
        placeholder: "Accent Color",
        options: ACCENT_PALETTE.map((c: ColorOption) => ({
          label: c.label,
          value: c.id,
          default: c.id === currentId,
        })),
      },
    ],
  };
}

export function buildBgSelect(
  currentId: string,
) {
  return {
    type: MessageComponentTypes.ActionRow as const,
    components: [
      {
        type: MessageComponentTypes.SelectMenu as const,
        customId: "pyon:bg",
        placeholder: "Background",
        options: BG_PALETTE.map((c: ColorOption) => ({
          label: c.label,
          value: c.id,
          default: c.id === currentId,
        })),
      },
    ],
  };
}

export function buildTextSelect(
  currentId: string,
) {
  return {
    type: MessageComponentTypes.ActionRow as const,
    components: [
      {
        type: MessageComponentTypes.SelectMenu as const,
        customId: "pyon:text",
        placeholder: "Text Color",
        options: TEXT_PALETTE.map((c: ColorOption) => ({
          label: c.label,
          value: c.id,
          default: c.id === currentId,
        })),
      },
    ],
  };
}

export function buildRemoveButton() {
  return {
    type: MessageComponentTypes.ActionRow as const,
    components: [
      {
        type: MessageComponentTypes.Button as const,
        style: ButtonStyles.Danger,
        customId: "pyon:delete",
        label: "Remove",
      },
    ],
  };
}

/**
 * Builds all action rows for a quote message:
 * - Style select (dynamic from Pyon layouts)
 * - Color select (from palette)
 * - Background select
 * - Text color select
 * - Remove button
 */
export function buildQuoteComponents(
  currentStyle: string,
  availableStyles: string[],
  currentAccentId: string,
  currentBgId: string,
  currentTextId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return [
    buildStyleSelect(currentStyle, availableStyles),
    buildAccentSelect(currentAccentId),
    buildBgSelect(currentBgId),
    buildTextSelect(currentTextId),
    buildRemoveButton(),
  ];
}
