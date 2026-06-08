import type { Message } from "@discordeno/bot";
import { renderQuote, type RenderResult } from "./renderer.ts";
import type { LayoutName } from "./layouts.ts";
import { getAvailableStyles } from "./layouts.ts";

const MAX_TEXT_LENGTH = 500;

// Discord emoji markup renders as 1 visual char but is ~26 raw chars.
// Count visual length by collapsing <:name:id> / <a:name:id> to 1 char each.
const DISCORD_EMOJI_RE = /<a?:[a-zA-Z0-9_]+:\d+>/g;

function visualSlice(text: string, maxVisual: number): string {
  // Replace emoji markup with \uFFFC (Object Replacement Character) — 1 char each
  // Track the original markup so we can restore it after slicing.
  const emojis: string[] = [];
  const collapsed = text.replace(DISCORD_EMOJI_RE, (m) => {
    emojis.push(m);
    return "\uFFFC";
  });

  const sliced = collapsed.slice(0, maxVisual);

  // Restore original markup for any \uFFFC that survived the slice
  let emojiIdx = 0;
  return sliced.replace(/\uFFFC/g, () => emojis[emojiIdx++] ?? "");
}

/**
 * - `<@id>` / `<@!id>` -> `@displayName` or `@globalName` / `@username`
 * - `<#id>` -> stripped (no channel mentions cache)
 * - `<:name:id>` / `<a:name:id>` -> passed through for Pyon to render
 */
function sanitizeText(text: string, _message: Message): string {
  // Build a lookup of mentioned users by string ID for display name resolution
  const mentionMap = new Map<string, { nick?: string; globalName?: string; username?: string }>();
  if (_message.mentions && Array.isArray(_message.mentions)) {
    for (const m of _message.mentions) {
      if (m?.id) {
        mentionMap.set(m.id.toString(), {
          nick: ("nick" in m) ? (m as { nick?: string }).nick : undefined,
          globalName: ("globalName" in m) ? (m as { globalName?: string }).globalName : undefined,
          username: ("username" in m) ? (m as { username?: string }).username : undefined,
        });
      }
    }
  }

  text = text.replace(/<@!?(\d+)>/g, (_match, id: string) => {
    const user = mentionMap.get(id);
    if (user) {
      return `@${user.nick ?? user.globalName ?? user.username ?? "user"}`;
    }
    return "@user";
  });

  text = text.replace(/<#(\d+)>/g, () => {
    // No channel name cache in Discordeno — just strip channel mentions
    return "";
  });

  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export interface QuoteData {
  text: string;
  displayName: string;
  username: string;
  avatarUrl: string;
}

/**
 * Constructs a Discord CDN avatar URL from user ID and avatar hash.
 */
/**
 * Converts a Discordeno icon bigint back to the original Discord hash string.
 * Discordeno prefixes animated hashes with 'a' and non-animated with 'b',
 * then converts to a hex bigint. We reverse that here.
 */
function iconBigintToHash(icon: bigint): string {
  const hex = icon.toString(16);
  return hex.startsWith("a") ? `a_${hex.substring(1)}` : hex.substring(1);
}

function makeUserAvatarUrl(userId: bigint, avatarHash: bigint | undefined | null, size = 256): string {
  if (!avatarHash) return `https://discord.com/embed/avatars/0.png`;
  const hash = iconBigintToHash(avatarHash);
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=${size}`;
}

function makeMemberAvatarUrl(guildId: bigint, userId: bigint, avatarHash: bigint, size = 256): string {
  const hash = iconBigintToHash(avatarHash);
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${hash}.${ext}?size=${size}`;
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
  overrideMember?: { nick?: string; avatar?: bigint },
): QuoteData & { authorId: string } {
  const rawText = sanitizeText(message.content ?? "", message);
  const text = visualSlice(rawText, MAX_TEXT_LENGTH);
  if (!text) throw new Error("Cannot quote an empty message");

  const author = message.author!;
  const member = overrideMember ?? message.member;

  const displayName =
    (member?.nick) ||
    author.globalName ||
    author.username;

  // Server-specific avatar first (member.avatar), then global
  let avatarUrl: string;
  if (message.guildId && member?.avatar) {
    avatarUrl = makeMemberAvatarUrl(message.guildId, author.id, member.avatar, 256);
  } else {
    avatarUrl = makeUserAvatarUrl(author.id, member?.avatar ?? author.avatar, 256);
  }

  return {
    text,
    displayName,
    username: author.username,
    avatarUrl,
    authorId: author.id.toString(),
  };
}

/**
 * Renders a quote card from extracted data.
 * If `style` is omitted or invalid a random layout is chosen.
 * Omitted colors fall back to Pyon's defaults.
 */
export async function buildQuote(
  data: QuoteData,
  style?: LayoutName,
  accentColor?: string,
  bgColor?: string,
  textColor?: string,
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
    bgColor,
    textColor,
  });
}
