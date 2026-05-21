import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { ACCENT_PALETTE, BG_PALETTE, TEXT_PALETTE, type ColorOption } from "./colors.ts";

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

export function buildAccentSelect(
  currentId: string,
): ActionRowBuilder<StringSelectMenuBuilder> {
  const select = new StringSelectMenuBuilder()
    .setCustomId("pyon:accent")
    .setPlaceholder("Accent Color")
    .addOptions(
      ACCENT_PALETTE.map((c: ColorOption) => ({
        label: c.label,
        value: c.id,
        default: c.id === currentId,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function buildBgSelect(
  currentId: string,
): ActionRowBuilder<StringSelectMenuBuilder> {
  const select = new StringSelectMenuBuilder()
    .setCustomId("pyon:bg")
    .setPlaceholder("Background")
    .addOptions(
      BG_PALETTE.map((c: ColorOption) => ({
        label: c.label,
        value: c.id,
        default: c.id === currentId,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function buildTextSelect(
  currentId: string,
): ActionRowBuilder<StringSelectMenuBuilder> {
  const select = new StringSelectMenuBuilder()
    .setCustomId("pyon:text")
    .setPlaceholder("Text Color")
    .addOptions(
      TEXT_PALETTE.map((c: ColorOption) => ({
        label: c.label,
        value: c.id,
        default: c.id === currentId,
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
): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
  return [
    buildStyleSelect(currentStyle, availableStyles),
    buildAccentSelect(currentAccentId),
    buildBgSelect(currentBgId),
    buildTextSelect(currentTextId),
    buildRemoveButton(),
  ];
}
