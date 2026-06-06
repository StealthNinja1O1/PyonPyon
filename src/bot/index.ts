import { createBot, Intents, InteractionTypes, ApplicationCommandTypes } from "@discordeno/bot";
import { handleMention } from "./handlers/mention.ts";
import { handleContextMenu } from "./handlers/context-menu.ts";
import { handleComponent } from "./handlers/buttons.ts";
import { initSessionStore } from "./services/sessions.ts";
import { deployCommands } from "./deploy-commands.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let bot: any;

export async function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN environment variable is required");

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) throw new Error("DISCORD_CLIENT_ID environment variable is required");

  bot = createBot({
    token,
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
    desiredProperties: {
      user: {
        id: true,
        username: true,
        globalName: true,
        avatar: true,
        toggles: true,
      },
      member: {
        id: true,
        nick: true,
        avatar: true,
        user: true,
      },
      message: {
        id: true,
        content: true,
        author: true,
        mentions: true,
        mentionedUserIds: true,
        messageReference: true,
        channelId: true,
        member: true,
        components: true,
        type: true,
      },
      messageReference: {
        messageId: true,
        channelId: true,
        guildId: true,
      },
      interaction: {
        id: true,
        type: true,
        data: true,
        token: true,
        message: true,
        channelId: true,
        guildId: true,
        user: true,
        member: true,
        applicationId: true,
        appPermissions: true,
        authorizingIntegrationOwners: true,
        version: true,
      },
    },
    events: {
      ready: ({ shardId, user }) => {
        console.log(`[pyonpyon] Ready! Logged in as ${user.id} (shard ${shardId})`);
      },
      messageCreate: async (message) => {
        if (message.author?.toggles?.bot) return;
        await handleMention(message as never);
      },
      interactionCreate: async (interaction) => {
        try {
          if (interaction.type === InteractionTypes.ApplicationCommand) {
            if (interaction.data?.type === ApplicationCommandTypes.Message) {
              await handleContextMenu(interaction as never);
            }
          } else if (interaction.type === InteractionTypes.MessageComponent) {
            await handleComponent(interaction as never);
          }
        } catch (err) {
          console.error("[pyonpyon] Error handling interaction:", err);
        }
      },
    },
  });

  initSessionStore(bot as never);

  await bot.start();

  console.log(`[pyonpyon] Gateway connected. Deploying commands...`);

  try {
    await deployCommands();
  } catch (err) {
    console.error("[pyonpyon] Failed to deploy commands:", err);
  }
}
