# RUCOGs Discord Bot

Official Discord bot for RUCOGS. It features integration with the project management backend.

## Commands

This bot uses slash commands. Commands that are protected are shown with a 🛡️ symbol.

- 🛡️ `/ping`
  - Returns ping information about the bot.
- `/members`
  - `search`
    - Searches for a member by name, and displays their profile information.
  - `list`
    - Lists out all members.
- 🛡️ `/project-discord`
  - `create`
    - Creates a discord presence for a project.
  - `archive`
    - Archives the project that owns the channel this command is executed in
  - `create-channel`
    - Creates a channel in a project's discord.
  - `delete-channel`
    - Deletes a channel in a project's discord.
- `/projects`
	- `search`
  	- Searches for a project by name, and displays the project's information.
	- `list`
  	- Lists out all the projects.
- 🛡️ `/stop`
  - Stops the bot.

## Permanently Archiving Discord Chats

To permanently save Discord channels, use [Tyrrrz's DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter). Download and run the latest release and then input the credentials for the  `RUCOGS Worker` bot.