import type { ButtonInteraction, StringSelectMenuInteraction, MessageFlags } from "discord.js";
import { getSession, deleteSession, updateSessionStyle, updateSessionColor } from "../services/sessions.ts";
import { buildQuote } from "../services/quote-builder.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { getColorHex } from "../services/colors.ts";
import type { LayoutName } from "../services/renderer.ts";

type ComponentInteraction = ButtonInteraction | StringSelectMenuInteraction;

export async function handleComponent(interaction: ComponentInteraction): Promise<void> {
  const customId = interaction.customId;
  if (customId === "pyon:delete") await handleDelete(interaction as ButtonInteraction);
  else if (customId === "pyon:style") await handleStyleSelect(interaction as StringSelectMenuInteraction);
  else if (customId === "pyon:color") await handleColorSelect(interaction as StringSelectMenuInteraction);
}

async function handleStyleSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const messageId = interaction.message.id;
  const session = getSession(messageId);

  if (!session) {
    await interaction.reply({
      content: "This quote's edit window has expired.",
      flags: 64 as MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.user.id !== session.creatorId) {
    await interaction.reply({
      content: "Only the quote creator can change its style.",
      flags: 64 as MessageFlags.Ephemeral,
    });
    return;
  }

  const newStyle = interaction.values[0] as LayoutName;
  const accentColor = getColorHex(session.currentColorId);
  await interaction.deferUpdate();

  try {
    const result = await buildQuote(session.quoteData, newStyle, accentColor);
    updateSessionStyle(messageId, result.style);

    await interaction.editReply({
      content: `Quote by **${session.quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ attachment: result.png, name: "quote.png" }],
      components: buildQuoteComponents(result.style, session.availableStyles, session.currentColorId),
    });
  } catch (err) {
    console.error("[pyonpyon] Error switching style:", err);
    await interaction
      .followUp({
        content: "Failed to update the quote style 😔",
        flags: 64 as MessageFlags.Ephemeral,
      })
      .catch(() => {});
  }
}

async function handleColorSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const messageId = interaction.message.id;
  const session = getSession(messageId);

  if (!session) {
    await interaction.reply({
      content: "This quote's edit window has expired.",
      flags: 64 as MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.user.id !== session.creatorId) {
    await interaction.reply({
      content: "Only the quote creator can change its color.",
      flags: 64 as MessageFlags.Ephemeral,
    });
    return;
  }

  const newColorId = interaction.values[0]!;
  const accentColor = getColorHex(newColorId);

  await interaction.deferUpdate();

  try {
    const result = await buildQuote(session.quoteData, session.currentStyle as LayoutName, accentColor);

    updateSessionColor(messageId, newColorId);

    await interaction.editReply({
      content: `Quote by **${session.quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ attachment: result.png, name: "quote.png" }],
      components: buildQuoteComponents(session.currentStyle, session.availableStyles, newColorId),
    });
  } catch (err) {
    console.error("[pyonpyon] Error switching color:", err);
    await interaction
      .followUp({
        content: "Failed to update the quote color 😔",
        flags: 64 as MessageFlags.Ephemeral,
      })
      .catch(() => {});
  }
}

async function handleDelete(interaction: ButtonInteraction): Promise<void> {
  const messageId = interaction.message.id;
  const session = getSession(messageId);

  if (!session) {
    await interaction.reply({
      content: "This quote has already been removed or expired.",
      flags: 64 as MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.user.id !== session.creatorId && interaction.user.id !== session.authorId) {
    await interaction.reply({
      content: "Only the quote creator or the quoted person can remove this.",
      flags: 64 as MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferUpdate();
  deleteSession(messageId);

  try {
    await interaction.editReply({
      content: `[Removed by ${interaction.user.globalName ?? interaction.user.username}]`,
      components: [],
      files: [],
    });
  } catch (editErr) {
    console.error("[pyonpyon] Failed to delete or edit quote message:", editErr);
  }
}
