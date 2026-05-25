import type { ButtonInteraction, StringSelectMenuInteraction, MessageFlags } from "discord.js";
import { getSession, deleteSession, updateSessionStyle, updateSessionColor, updateSessionBg, updateSessionText } from "../services/sessions.ts";
import { buildQuote } from "../services/quote-builder.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { getAccentHex, getBgHex, getTextHex } from "../services/colors.ts";
import type { LayoutName } from "../services/renderer.ts";

type ComponentInteraction = ButtonInteraction | StringSelectMenuInteraction;

export async function handleComponent(interaction: ComponentInteraction): Promise<void> {
  const customId = interaction.customId;
  if (customId === "pyon:delete") await handleDelete(interaction as ButtonInteraction);
  else if (customId === "pyon:style") await handleStyleSelect(interaction as StringSelectMenuInteraction);
  else if (customId === "pyon:accent") await handleAccentSelect(interaction as StringSelectMenuInteraction);
  else if (customId === "pyon:bg") await handleBgSelect(interaction as StringSelectMenuInteraction);
  else if (customId === "pyon:text") await handleTextSelect(interaction as StringSelectMenuInteraction);
}

function checkSession(interaction: ComponentInteraction) {
  const session = getSession(interaction.message.id);
  if (!session) {
    interaction.reply({ content: "This quote's edit window has expired.", flags: 64 as MessageFlags.Ephemeral }).catch(() => {});
    return null;
  }
  if (interaction.user.id !== session.creatorId) {
    interaction.reply({ content: "Only the quote creator can change this.", flags: 64 as MessageFlags.Ephemeral }).catch(() => {});
    return null;
  }
  return session;
}

async function reRender(
  interaction: StringSelectMenuInteraction,
  session: NonNullable<ReturnType<typeof getSession>>,
): Promise<void> {
  const accentColor = getAccentHex(session.currentColorId);
  const bgColor = getBgHex(session.currentBgId);
  const textColor = getTextHex(session.currentTextId);

  const result = await buildQuote(session.quoteData, session.currentStyle as LayoutName, accentColor, bgColor, textColor);

  // Race condition guard: if session was deleted mid-render (e.g. concurrent Remove click), bail out pyon.
  if (!getSession(interaction.message.id)) return;

  await interaction.editReply({
    content: `Quote by **${session.quoteData.displayName}** · Style: **${result.style}**`,
    files: [{ attachment: result.png, name: "quote.png" }],
    components: buildQuoteComponents(session.currentStyle, session.availableStyles, session.currentColorId, session.currentBgId, session.currentTextId),
  });
}

async function handleStyleSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newStyle = interaction.values[0] as LayoutName;
  await interaction.deferUpdate();

  try {
    updateSessionStyle(interaction.message.id, newStyle);
    session.currentStyle = newStyle;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching style:", err);
    await interaction.followUp({ content: "Failed to update the quote style 😔", flags: 64 as MessageFlags.Ephemeral }).catch(() => {});
  }
}

async function handleAccentSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newId = interaction.values[0]!;
  await interaction.deferUpdate();

  try {
    updateSessionColor(interaction.message.id, newId);
    session.currentColorId = newId;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching accent:", err);
    await interaction.followUp({ content: "Failed to update the accent color 😔", flags: 64 as MessageFlags.Ephemeral }).catch(() => {});
  }
}

async function handleBgSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newId = interaction.values[0]!;
  await interaction.deferUpdate();

  try {
    updateSessionBg(interaction.message.id, newId);
    session.currentBgId = newId;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching background:", err);
    await interaction.followUp({ content: "Failed to update the background 😔", flags: 64 as MessageFlags.Ephemeral }).catch(() => {});
  }
}

async function handleTextSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newId = interaction.values[0]!;
  await interaction.deferUpdate();

  try {
    updateSessionText(interaction.message.id, newId);
    session.currentTextId = newId;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching text color:", err);
    await interaction.followUp({ content: "Failed to update the text color 😔", flags: 64 as MessageFlags.Ephemeral }).catch(() => {});
  }
}

async function handleDelete(interaction: ButtonInteraction): Promise<void> {
  const messageId = interaction.message.id;
  const session = getSession(messageId);

  if (!session) {
    await interaction.reply({ content: "This quote has already been removed or expired.", flags: 64 as MessageFlags.Ephemeral });
    return;
  }

  if (interaction.user.id !== session.creatorId && interaction.user.id !== session.authorId) {
    await interaction.reply({ content: "Only the quote creator or the quoted person can remove this.", flags: 64 as MessageFlags.Ephemeral });
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
