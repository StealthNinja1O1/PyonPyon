import { Client, GatewayIntentBits, Events } from "discord.js";
import { handleMention } from "./handlers/mention.ts";
import { handleContextMenu } from "./handlers/context-menu.ts";
import { handleComponent } from "./handlers/buttons.ts";
import { initSessionStore } from "./services/sessions.ts";
import { deployCommands } from "./deploy-commands.ts";

export async function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN environment variable is required");

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) throw new Error("DISCORD_CLIENT_ID environment variable is required");

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });

  initSessionStore(client);

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`[pyonpyon] Ready! Logged in as ${readyClient.user.tag} (${readyClient.user.id})`);
    console.log(`[pyonpyon] Serving ${readyClient.guilds.cache.size} guild(s)`);

    try {
      await deployCommands();
    } catch (err) {
      console.error("[pyonpyon] Failed to deploy commands:", err);
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    await handleMention(client, message);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isMessageContextMenuCommand()) await handleContextMenu(interaction);
      else if (interaction.isButton()) await handleComponent(interaction);
      else if (interaction.isStringSelectMenu()) await handleComponent(interaction);
    } catch (err) {
      console.error("[pyonpyon] Error handling interaction:", err);
    }
  });

  client.on(Events.Error, (err) => {
    const msg = (err as { error?: { message?: string } })?.error?.message ?? String(err);
    if (msg.includes("Disallowed Intents") || msg.includes("disallowed intents"))
      throw new Error("Used disallowed intents");
  });

  await client.login(token);
}
