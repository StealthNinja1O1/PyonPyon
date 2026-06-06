import type { QuoteData as QuoteData } from "./quote-builder.ts";

export interface QuoteSession {
  creatorId: string;
  authorId: string;
  currentStyle: string;
  currentColorId: string;
  currentBgId: string;
  currentTextId: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bot: any = null;

export function initSessionStore(b: any) {
  bot = b;
}

export function createSession(messageId: string, data: QuoteSession): void {
  const timer = setTimeout(() => handleExpiry(messageId), SESSION_TTL_MS);
  timers.set(messageId, timer);
  sessions.set(messageId, data);
  console.log(`[pyonpyon] Session created: ${messageId} (expires in ${SESSION_TTL_MS / 1000}s, creator=${data.creatorId})`);
}

async function handleExpiry(messageId: string) {
  const session = sessions.get(messageId);
  if (!session || !bot) return;

  try {
    const channelId = BigInt(session.channelId);
    const msgId = BigInt(messageId);
    await bot.helpers.editMessage(channelId, msgId, { components: [] });
    console.log(`[pyonpyon] Session expired, components removed: ${messageId}`);
  } catch {
    // Channel edit failed (bot not in server). Fall back to webhook if stored.
    if (session.webhookId && session.webhookToken) {
      try {
        await bot.rest.editWebhookMessage(
          BigInt(session.webhookId),
          session.webhookToken,
          messageId,
          { components: [] },
        );
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

export function updateSessionBg(messageId: string, bgId: string): void {
  const session = sessions.get(messageId);
  if (session) session.currentBgId = bgId;
}

export function updateSessionText(messageId: string, textId: string): void {
  const session = sessions.get(messageId);
  if (session) session.currentTextId = textId;
}
