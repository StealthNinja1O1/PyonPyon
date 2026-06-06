import { createRestManager } from "@discordeno/bot";

const commands = [
  {
    name: "Create Quote",
    type: 3, // ApplicationCommandType.Message
    // Guild install (0) + User install (1)
    integration_types: [0, 1],
    // Guild (0), Bot DM (1), Private Channel (2)
    contexts: [0, 1, 2],
  },
];

export async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID are required");

  const rest = createRestManager({ token, applicationId: BigInt(clientId) });
  console.log("[pyonpyon] Deploying application commands...");

  await rest.upsertGlobalApplicationCommands(commands as [typeof commands[number]]);
  console.log("[pyonpyon] Commands deployed successfully!");
}

if (import.meta.main) {
  deployCommands().catch(console.error);
}
