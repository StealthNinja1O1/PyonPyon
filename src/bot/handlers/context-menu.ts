import type { MessageContextMenuCommandInteraction } from "discord.js";
import { extractQuoteData, buildQuote } from "../services/quote-builder.ts";
import { getAvailableStyles } from "../services/layouts.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { createSession } from "../services/sessions.ts";

export async function handleContextMenu(
  interaction: MessageContextMenuCommandInteraction,
): Promise<void> {
  const targetMessage = interaction.targetMessage;

  if (!targetMessage) {
    await interaction.reply({
      content: "Couldn't load that message.",
      flags: 64,
    });
    return;
  }

  if (!targetMessage.content) {
    await interaction.reply({
      content: "Can't quote an empty message!",
      flags: 64,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const quoteData = extractQuoteData(targetMessage);
    const availableStyles = getAvailableStyles();
    const result = await buildQuote(quoteData);

    const reply = await interaction.editReply({
      content: `Quote by **${quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ attachment: result.png, name: "quote.png" }],
      components: buildQuoteComponents(result.style, availableStyles, "default", "default", "default"),
    });

    createSession(reply.id, {
      creatorId: interaction.user.id,
      authorId: quoteData.authorId,
      currentStyle: result.style,
      currentColorId: "default",
      currentBgId: "default",
      currentTextId: "default",
      availableStyles,
      channelId: interaction.channelId!,
      quoteData: {
        text: quoteData.text,
        displayName: quoteData.displayName,
        username: quoteData.username,
        avatarUrl: quoteData.avatarUrl,
      },
      webhookId: interaction.applicationId,
      webhookToken: interaction.token,
    });
  } catch (err) {
    console.error("[pyonpyon] Error handling context menu:", err);
    await interaction
      .editReply("Failed to create quote 😔")
      .catch(() => {});
  }
}
