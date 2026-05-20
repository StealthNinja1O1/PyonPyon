import { startBot } from "./bot/index.ts";

const INTENT_HELP = `
═══════════════════════════════════════════════════════
  Disallowed Intents — Quick Fix
═══════════════════════════════════════════════════════

  The Message Content Intent is required but not enabled.

  1. Go to https://discord.com/developers/applications
  2. Select your application
  3. Navigate to Bot → Privileged Gateway Intents
  4. Enable "Message Content Intent"
  5. Save changes and restart the bot

═══════════════════════════════════════════════════════
`;

startBot().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("Disallowed Intents") || msg.includes("disallowed intents")) console.error(INTENT_HELP);
  else console.error("[pyonpyon] Failed to start:", err);

  process.exit(1);
});
