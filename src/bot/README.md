# PyonPyon

A Discord bot that turns messages into quote cards to bully your friends, powered by [Pyon](https://github.com/miyo-hime/pyon) by [Miyo](https://github.com/miyo-hime).
## Features

- Two ways to quote:
  - @mention + reply: Reply to any message and mention the bot (server bot)
  - Context menu: Right-click (or long press) a message -> Apps -> Create Quote (user app)
- Style switching:  Switch between layouts with a click. Only the quote creator can edit
- Delete protection: Both the quote creator and the quoted person can remove a quote
- 5-minute edit window: After 5 minutes, buttons are removed and the image stays permanently.
- Dynamic layouts: Automatically picks up new layouts added to Pyon. If Miyo adds a theme, it shows up here on rebuild

## Setup
### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Navigate to Bot -> reset the token and copy it.
3. Enable the Message Content Intent under Privileged Gateway Intents.
4. Navigate to OAuth2 -> URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Attach Files`, `Read Message History`
5. Use the generated URL to invite the bot to your server.

The bot also works as a user-installable app. The "Create Quote" context menu action is available when installed as a user app in any server, although it might not get the server profile picture if the bot is not in the server.

### 2. Install & Run
#### Bun

```bash
bun install
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and DISCORD_CLIENT_ID
bun start
```

#### With Docker
```bash
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and DISCORD_CLIENT_ID
docker compose up --build -d
```
## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | YES | Your Discord bot token |
| `DISCORD_CLIENT_ID` | YES | Your Discord application client ID |

## Usage
### Creating a Quote

@mention (in servers):
1. Reply to any message
2. Type `@PyonPyon` in your reply

Context menu (everywhere):
1. Right-click (or long press) any message
2. Go to Apps -> Create Quote
3. The bot responds with a quote card image

After 5 minutes, the buttons are automatically removed and the quote image stays as is.

## Project Structure

```
src/
  index.ts                  # Entry point
  bot/                      # Bot code
      index.ts              # Bot client & event loop
      deploy-commands.ts    # Register Discord commands
      handlers/
        mention.ts          # @mention + reply trigger
        context-menu.ts     # Context menu trigger
        buttons.ts          # Style switch & delete buttons
      services/
        layouts.ts          # Dynamic layout discovery from Pyon
        renderer.ts         # Pyon render pipeline
        sessions.ts         # 5-min expiry session store
        action-rows.ts      # Discord button builder
        quote-builder.ts    # Message data -> quote card
  pyon/                     # Pyon renderer (untouched upstream)
    src/                    # https://github.com/miyo-hime/pyon
```
## License

This project uses [Pyon](https://github.com/miyo-hime/pyon). Please respect the original project's license (Which is none rn but check it)
