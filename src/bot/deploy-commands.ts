import { REST, Routes, ApplicationCommandType } from "discord.js";

const commands = [
  {
    name: "Create Quote",
    type: ApplicationCommandType.Message,
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

  const rest = new REST({ version: "10" }).setToken(token);
  console.log("[pyonpyon] Deploying application commands...");

  await rest.put(Routes.applicationCommands(clientId), {
    body: commands,
  });
  console.log("[pyonpyon] Commands deployed successfully!");
}

if (import.meta.main) {
  deployCommands().catch(console.error);
}
