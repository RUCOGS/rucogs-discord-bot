import authConfig from '@config/auth.config.json';
import serverConfig from '@config/server.config.json';
import { configureActivityStatus } from '@src/classes/activity-status';
import { configCommands } from '@src/classes/command';
import { configUtils } from '@src/classes/utils';
import { BackendService } from '@src/services/backend';
import { CdnService } from '@src/services/cdn';
import { ProjectService } from '@src/services/project';
import { Client } from 'discord.js';

export async function startServer(debug: boolean = false) {
  const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES'],
  });

  const backend = new BackendService(authConfig, serverConfig);
  const cdn = new CdnService(serverConfig);
  const project = new ProjectService(client, backend);

  await configCommands(client, {
    project,
    backend,
    cdn,
  });
  configUtils(client);
  configureActivityStatus(client);
  await client.login(authConfig.bot.token);

  client.once('ready', () => {
    console.log(`🟢 Ready: ${client.user?.tag}`);
  });
  client.once('reconnecting', () => {
    console.log('🟠 Reconnecting');
  });
  client.once('disconnect', () => {
    console.log('🔴 Disconnected');
  });
}
