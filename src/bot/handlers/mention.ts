// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { Message } from "@discordeno/bot";
import { bot } from "../index.ts";
import { extractQuoteData, buildQuote } from "../services/quote-builder.ts";
import { getAvailableStyles } from "../services/layouts.ts";
import { buildQuoteComponents } from "../services/action-rows.ts";
import { createSession } from "../services/sessions.ts";

export async function handleMention(message: Message): Promise<void> {
  if (!message.mentionedUserIds?.includes(bot.id)) return;
  if (!message.messageReference?.messageId) return;

  try {
    const referencedMessage = await bot.helpers.getMessage(message.channelId!, message.messageReference.messageId);

    if (!referencedMessage.content) {
      await bot.helpers.sendMessage(message.channelId!, {
        content: "Can't quote an empty message!",
        messageReference: { messageId: message.id, channelId: message.channelId },
      });
      return;
    }

    const quoteData = extractQuoteData(referencedMessage);
    const availableStyles = getAvailableStyles();
    const result = await buildQuote(quoteData);

    const reply = await bot.helpers.sendMessage(message.channelId!, {
      content: `Quote by **${quoteData.displayName}** · Style: **${result.style}**`,
      files: [{ name: "quote.png", blob: new Blob([new Uint8Array(result.png)]) }],
      components: buildQuoteComponents(result.style, availableStyles, "default", "default", "default"),
      messageReference: { messageId: message.id, channelId: message.channelId },
    });

    createSession(reply.id.toString(), {
      creatorId: message.author!.id.toString(),
      authorId: quoteData.authorId,
      currentStyle: result.style,
      currentColorId: "default",
      currentBgId: "default",
      currentTextId: "default",
      availableStyles,
      channelId: message.channelId!.toString(),
      quoteData,
    });
  } catch (err) {
    console.error("[pyonpyon] Error handling mention:", err);
    await bot.helpers.sendMessage(message.channelId!, {
      content: "Failed to create quote 😔",
      messageReference: { messageId: message.id, channelId: message.channelId },
    }).catch(() => {});
  }
}
