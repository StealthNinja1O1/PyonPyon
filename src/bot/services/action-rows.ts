import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { COLOR_PALETTE, type ColorOption } from "./colors.ts";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildStyleSelect(
  currentStyle: string,
  availableStyles: string[],
): ActionRowBuilder<StringSelectMenuBuilder> {
  const select = new StringSelectMenuBuilder()
    .setCustomId("pyon:style")
    .setPlaceholder("Style")
    .addOptions(
      availableStyles.map((style) => ({
        label: capitalize(style),
        value: style,
        default: style === currentStyle,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function buildColorSelect(
  currentColorId: string,
): ActionRowBuilder<StringSelectMenuBuilder> {
  const select = new StringSelectMenuBuilder()
    .setCustomId("pyon:color")
    .setPlaceholder("Color")
    .addOptions(
      COLOR_PALETTE.map((color: ColorOption) => ({
        label: color.label,
        value: color.id,
        default: color.id === currentColorId,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function buildRemoveButton(): ActionRowBuilder<ButtonBuilder> {
  const button = new ButtonBuilder()
    .setCustomId("pyon:delete")
    .setLabel("Remove")
    .setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

/**
 * Builds all action rows for a quote message:
 * - Style select (dynamic from Pyon layouts)
 * - Color select (from palette)
 * - Remove button
 */
export function buildQuoteComponents(
  currentStyle: string,
  availableStyles: string[],
  currentColorId: string,
): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
  return [
    buildStyleSelect(currentStyle, availableStyles),
    buildColorSelect(currentColorId),
    buildRemoveButton(),
  ];
}
