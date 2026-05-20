import type { Message } from "discord.js";
import { renderQuote, type RenderResult } from "./renderer.ts";
import type { LayoutName } from "./layouts.ts";
import { getAvailableStyles } from "./layouts.ts";

const MAX_TEXT_LENGTH = 500;

export interface QuoteData {
  text: string;
  displayName: string;
  username: string;
  avatarUrl: string;
}

/**
 * Extracts the data needed to render a quote card from a Discord message.
 *
 * - Display name: server nickname > global name > username
 * - Avatar: server-specific avatar > global avatar
 * - Username: not much to say here, its a name
 */
export function extractQuoteData(
  message: Message,
): QuoteData & { authorId: string } {
  const text = message.content.slice(0, MAX_TEXT_LENGTH);
  if (!text) throw new Error("Cannot quote an empty message");

  const displayName =
    message.member?.displayName ??
    message.author.globalName ??
    message.author.username;

  // Server-specific avatar first
  const avatarUrl =
    message.member?.avatarURL({ extension: "png", size: 256, forceStatic: true }) ??
    message.author.displayAvatarURL({
      extension: "png",
      size: 256,
      forceStatic: true,
    });

  return {
    text,
    displayName,
    username: message.author.username,
    avatarUrl,
    authorId: message.author.id,
  };
}

/**
 * Renders a quote card from extracted data.
 * If `style` is omitted or invalid a random layout is chosen.
 * If `accentColor` is omitted Pyon uses its default (#ff5fa2).
 */
export async function buildQuote(
  data: QuoteData,
  style?: LayoutName,
  accentColor?: string,
): Promise<RenderResult> {
  const availableStyles = getAvailableStyles();
  const validStyle =
    style && availableStyles.includes(style) ? style : undefined;

  return renderQuote({
    text: data.text,
    displayName: data.displayName,
    username: data.username,
    avatarUrl: data.avatarUrl,
    style: validStyle,
    accentColor,
  });
}
