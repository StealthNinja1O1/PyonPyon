// Discordeno's SetupDesiredProps types are incompatible with the base Interaction type.
// Using `never` cast from the event handler side — accept the widest type here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { Interaction } from "@discordeno/bot";
import { bot } from "../index.ts";
import { getSession, deleteSession, updateSessionStyle, updateSessionColor, updateSessionBg, updateSessionText } from "../services/sessions.ts";
import { buildQuote } from "../services/quote-builder.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { getAccentHex, getBgHex, getTextHex } from "../services/colors.ts";
import type { LayoutName } from "../services/renderer.ts";

export async function handleComponent(interaction: Interaction): Promise<void> {
  const customId = interaction.data?.customId;
  if (customId === "pyon:delete") await handleDelete(interaction);
  else if (customId === "pyon:style") await handleStyleSelect(interaction);
  else if (customId === "pyon:accent") await handleAccentSelect(interaction);
  else if (customId === "pyon:bg") await handleBgSelect(interaction);
  else if (customId === "pyon:text") await handleTextSelect(interaction);
}

function checkSession(interaction: Interaction) {
  const messageId = interaction.message?.id?.toString();
  if (!messageId) return null;
  const session = getSession(messageId);
  if (!session) {
    interaction.respond({ content: "This quote's edit window has expired.", flags: 64 }).catch(() => {});
    return null;
  }
  if (interaction.user?.id.toString() !== session.creatorId) {
    interaction.respond({ content: "Only the quote creator can change this.", flags: 64 }).catch(() => {});
    return null;
  }
  return session;
}

async function reRender(
  interaction: Interaction,
  session: NonNullable<ReturnType<typeof getSession>>,
): Promise<void> {
  const accentColor = getAccentHex(session.currentColorId);
  const bgColor = getBgHex(session.currentBgId);
  const textColor = getTextHex(session.currentTextId);

  const result = await buildQuote(session.quoteData, session.currentStyle as LayoutName, accentColor, bgColor, textColor);

  // Race condition guard: if session was deleted mid-render (e.g. concurrent Remove click), bail out pyon.
  if (!getSession(interaction.message?.id?.toString() ?? "")) return;

  await interaction.edit(
    {
      content: `Quote by **${session.quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ name: "quote.png", blob: new Blob([new Uint8Array(result.png)]) }],
      components: buildQuoteComponents(session.currentStyle, session.availableStyles, session.currentColorId, session.currentBgId, session.currentTextId),
    },
    interaction.message?.id,
  );
}

async function handleStyleSelect(interaction: Interaction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newStyle = (interaction.data?.values?.[0] ?? "") as LayoutName;
  await interaction.deferEdit();

  try {
    updateSessionStyle(interaction.message!.id.toString(), newStyle);
    session.currentStyle = newStyle;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching style:", err);
    await bot.helpers.sendFollowupMessage(interaction.token, { content: "Failed to update the quote style 😔", flags: 64 }).catch(() => {});
  }
}

async function handleAccentSelect(interaction: Interaction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newId = interaction.data?.values?.[0]!;
  await interaction.deferEdit();

  try {
    updateSessionColor(interaction.message!.id.toString(), newId);
    session.currentColorId = newId;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching accent:", err);
    await bot.helpers.sendFollowupMessage(interaction.token, { content: "Failed to update the accent color 😔", flags: 64 }).catch(() => {});
  }
}

async function handleBgSelect(interaction: Interaction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newId = interaction.data?.values?.[0]!;
  await interaction.deferEdit();

  try {
    updateSessionBg(interaction.message!.id.toString(), newId);
    session.currentBgId = newId;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching background:", err);
    await bot.helpers.sendFollowupMessage(interaction.token, { content: "Failed to update the background 😔", flags: 64 }).catch(() => {});
  }
}

async function handleTextSelect(interaction: Interaction): Promise<void> {
  const session = checkSession(interaction);
  if (!session) return;

  const newId = interaction.data?.values?.[0]!;
  await interaction.deferEdit();

  try {
    updateSessionText(interaction.message!.id.toString(), newId);
    session.currentTextId = newId;
    await reRender(interaction, session);
  } catch (err) {
    console.error("[pyonpyon] Error switching text color:", err);
    await bot.helpers.sendFollowupMessage(interaction.token, { content: "Failed to update the text color 😔", flags: 64 }).catch(() => {});
  }
}

async function handleDelete(interaction: Interaction): Promise<void> {
  const messageId = interaction.message?.id?.toString();
  const session = messageId ? getSession(messageId) : undefined;

  if (!session) {
    await interaction.respond({ content: "This quote has already been removed or expired.", flags: 64 });
    return;
  }

  if (interaction.user?.id.toString() !== session.creatorId && interaction.user?.id.toString() !== session.authorId) {
    await interaction.respond({ content: "Only the quote creator or the quoted person can remove this.", flags: 64 });
    return;
  }

  await interaction.deferEdit();
  if (messageId) deleteSession(messageId);

  try {
    await interaction.edit(
      {
        content: `[Removed by ${interaction.user?.globalName ?? interaction.user?.username}]`,
        components: [],
        files: [],
        attachments: [],
      } as any,
      interaction.message?.id,
    );
  } catch (editErr) {
    console.error("[pyonpyon] Failed to delete or edit quote message:", editErr);
  }
}
