// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { Interaction } from "@discordeno/bot";
import { extractQuoteData, buildQuote } from "../services/quote-builder.ts";
import { getAvailableStyles } from "../services/layouts.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { createSession } from "../services/sessions.ts";

export async function handleContextMenu(
  interaction: Interaction,
): Promise<void> {
  const resolvedMessages = interaction.data?.resolved?.messages;
  const targetMessage = resolvedMessages
    ? [...resolvedMessages.values()][0]
    : undefined;

  if (!targetMessage) {
    await interaction.respond({ content: "Couldn't load that message.", flags: 64 });
    return;
  }

  if (!targetMessage.content) {
    await interaction.respond({ content: "Can't quote an empty message!", flags: 64 });
    return;
  }

  await interaction.defer();

  try {
    const quoteData = extractQuoteData(targetMessage);
    const availableStyles = getAvailableStyles();
    const result = await buildQuote(quoteData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reply = (await interaction.edit({
      content: `Quote by **${quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ name: "quote.png", blob: new Blob([new Uint8Array(result.png)]) }],
      components: buildQuoteComponents(result.style, availableStyles, "default", "default", "default"),
    })) as any;

    createSession(reply.id.toString(), {
      creatorId: interaction.user!.id.toString(),
      authorId: quoteData.authorId,
      currentStyle: result.style,
      currentColorId: "default",
      currentBgId: "default",
      currentTextId: "default",
      availableStyles,
      channelId: interaction.channelId!.toString(),
      quoteData,
      webhookId: interaction.applicationId?.toString(),
      webhookToken: interaction.token,
    });
  } catch (err) {
    console.error("[pyonpyon] Error handling context menu:", err);
    await interaction
      .edit({ content: "Failed to create quote 😔" })
      .catch(() => {});
  }
}
