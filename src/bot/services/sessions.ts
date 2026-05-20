import { Client, WebhookClient } from "discord.js";

export interface QuoteData {
  text: string;
  displayName: string;
  username: string;
  avatarUrl: string;
}

export interface QuoteSession {
  creatorId: string;
  authorId: string;
  currentStyle: string;
  currentColorId: string;
  availableStyles: string[];
  channelId: string;
  quoteData: QuoteData;
  /** Webhook credentials for editing when bot lacks server access (user-app mode). */
  webhookId?: string;
  webhookToken?: string;
}

const sessions = new Map<string, QuoteSession>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const SESSION_TTL_MS = 5 * 60 * 1000;

let client: Client | null = null;

export function initSessionStore(c: Client) {
  client = c;
}

export function createSession(messageId: string, data: QuoteSession): void {
  const timer = setTimeout(() => handleExpiry(messageId), SESSION_TTL_MS);
  timers.set(messageId, timer);
  sessions.set(messageId, data);
  console.log(`[pyonpyon] Session created: ${messageId} (expires in ${SESSION_TTL_MS / 1000}s, creator=${data.creatorId})`);
}

async function handleExpiry(messageId: string) {
  const session = sessions.get(messageId);
  if (!session || !client) return;

  try {
    const channel = await client.channels.fetch(session.channelId);
    if (channel?.isTextBased()) {
      const msg = await channel.messages.fetch(messageId);
      await msg.edit({ components: [] });
      console.log(`[pyonpyon] Session expired, components removed: ${messageId}`);
    }
  } catch {
    // Channel fetch failed (bot not in server, fall back to the interaction webhook if we stored one.
    if (session.webhookId && session.webhookToken) {
      try {
        const webhook = new WebhookClient({ id: session.webhookId, token: session.webhookToken });
        await webhook.editMessage(messageId, { components: [] });
      } catch (webhookErr) {
        console.warn(`[pyonpyon] Webhook fallback also failed for ${messageId}:`, webhookErr);
      }
    } else {
      console.warn(`[pyonpyon] Cannot remove components for ${messageId}: no channel access and no webhook stored.`);
    }
  } finally {
    sessions.delete(messageId);
    timers.delete(messageId);
  }
}

export function getSession(messageId: string): QuoteSession | undefined {
  return sessions.get(messageId);
}

export function deleteSession(messageId: string): void {
  const timer = timers.get(messageId);
  if (timer) clearTimeout(timer);
  timers.delete(messageId);
  sessions.delete(messageId);
}

export function updateSessionStyle(messageId: string, style: string): void {
  const session = sessions.get(messageId);
  if (session) session.currentStyle = style;
}

export function updateSessionColor(messageId: string, colorId: string): void {
  const session = sessions.get(messageId);
  if (session) session.currentColorId = colorId;
}
