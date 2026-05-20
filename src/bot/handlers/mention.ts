import type { Client, Message } from "discord.js";
import { extractQuoteData, buildQuote } from "../services/quote-builder.ts";
import { getAvailableStyles } from "../services/layouts.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { createSession } from "../services/sessions.ts";

export async function handleMention(client: Client, message: Message): Promise<void> {
  if (!message.mentions.has(client.user!.id)) return;
  if (!message.reference?.messageId) return;

  try {
    const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

    if (!referencedMessage.content) {
      await message.reply("Can't quote an empty message!");
      return;
    }

    const quoteData = extractQuoteData(referencedMessage);
    const availableStyles = getAvailableStyles();
    const result = await buildQuote(quoteData);

    const reply = await message.reply({
      content: `Quote by **${quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ attachment: result.png, name: "quote.png" }],
      components: buildQuoteComponents(result.style, availableStyles, "default"),
    });

    createSession(reply.id, {
      creatorId: message.author.id,
      authorId: quoteData.authorId,
      currentStyle: result.style,
      currentColorId: "default",
      availableStyles,
      channelId: message.channelId,
      quoteData: {
        text: quoteData.text,
        displayName: quoteData.displayName,
        username: quoteData.username,
        avatarUrl: quoteData.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[pyonpyon] Error handling mention:", err);
    await message.reply("Failed to create quote 😔").catch(() => {});
  }
}
