import AuthConfig from '@config/auth.config.json';
import ServerConfig from '@config/server.config.json';
import { configureActivityStatus } from '@src/classes/activity-status';
import { configCommands } from '@src/classes/command';
import { configUtils } from '@src/classes/utils';
import { BackendService } from '@src/services/backend';
import { CdnService } from '@src/services/cdn';
import { EntityManager } from '@src/services/entity-manager';
import { Client } from 'discord.js';

export async function startServer(debug: boolean = false) {
  const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES'],
  });

  const backend = new BackendService(AuthConfig, ServerConfig);
  const cdn = new CdnService(ServerConfig);
  const entityManager = new EntityManager(backend);

  await configCommands(client, {
    backend,
    cdn,
    entityManager,
    serverConfig: ServerConfig,
    authConfig: AuthConfig,
  });
  configUtils(client);
  configureActivityStatus(client);
  await client.login(AuthConfig.bot.token);

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
