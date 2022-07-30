import { configureActivityStatus } from '@src/misc/activity-status';
import { configCommands } from '@src/misc/command';
import { configUtils } from '@src/misc/utils';
import { BackendService } from '@src/services/backend';
import { CdnService } from '@src/services/cdn';
import { EntityManager } from '@src/services/entity-manager';
import { GraphQLAPIService } from '@src/services/graphql-api';
import { Client } from 'discord.js';
import { AuthConfig, ServerConfig } from './config';

export async function startServer(debug: boolean = false) {
  const serverConfig: ServerConfig = debug
    ? require('@src/config/server.debug.config.json')
    : require('@src/config/server.config.json');
  const authConfig: AuthConfig = debug
    ? require('@src/config/auth.debug.config.json')
    : require('@src/config/auth.config.json');

  const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES'],
  });

  const backend = new BackendService(authConfig, serverConfig);
  const cdn = new CdnService(serverConfig);
  const entityManager = new EntityManager(backend);
  const graphQLAPI = new GraphQLAPIService(backend);

  await configCommands({
    client,
    backend,
    cdn,
    graphQLAPI,
    entityManager,
    serverConfig: serverConfig,
    authConfig: authConfig,
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
