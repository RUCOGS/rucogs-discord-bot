import { gql } from '@apollo/client/core';
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CdnService } from '@src/services/cdn';
import { EntityManager } from '@src/services/entity-manager';
import { GraphQLAPIService } from '@src/services/graphql-api';
import { DefaultSecurityContext, SecurityContext } from '@src/shared/security';
import { Client, CommandInteraction, Interaction } from 'discord.js';
import { glob } from 'glob';
import path from 'path';
import { BackendService } from '../services/backend';
import { AuthConfig, ServerConfig } from './config';
import { defaultEmbed, DefaultEmbedType } from './utils';

export interface CommandContext extends CommandContextInjected {
  securityContext: SecurityContext;
}

export interface CommandContextInjected {
  client: Client;
  entityManager: EntityManager;
  backend: BackendService;
  graphQLAPI: GraphQLAPIService;
  cdn: CdnService;
  serverConfig: ServerConfig;
  authConfig: AuthConfig;
}

export interface Command {
  withAuth?: boolean;
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  init?: (context: CommandContextInjected) => Promise<void>;
  run: (interaction: CommandInteraction, context: CommandContext) => Promise<void>;
}

export function isCommand(object: any): object is Command {
  return object !== undefined && object.data && object.run;
}

export const Commands = new Map<string, Command>();

export async function loadCommands() {
  const files = glob.sync('src/commands/**/*.ts');
  const foundCommands: Command[] = [];
  for (const file of files) {
    const modulePath = path.parse(file);
    const maybeCommandModule = await import('..' + modulePath.dir.slice('src'.length) + '/' + modulePath.name);
    const defaultExport = maybeCommandModule.default;
    if (isCommand(defaultExport)) {
      foundCommands.push(defaultExport);
    }
  }
  return foundCommands;
}

export async function configCommands(context: CommandContextInjected) {
  context.client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      const command = Commands.get(interaction.commandName);
      if (command) {
        try {
          let securityContext: SecurityContext = DefaultSecurityContext;
          if (command.withAuth) {
            const loginIdentity = await context.entityManager.userLoginIdentity.findOne({
              filter: {
                name: { eq: 'discord' },
                identityId: { eq: interaction.user.id },
              },
              projection: {
                userId: true,
              },
            });
            if (!loginIdentity)
              throw new Error(
                'Could not find your COGS account for authentication! Make sure you have an account at [cogs.club](https://cogs.club).',
              );

            const securityContextResult = await context.backend.withAuth().query<{
              securityContext: SecurityContext;
            }>({
              query: gql`
                query GetInteractionSecurityContext($userId: ID!) {
                  securityContext(userId: $userId)
                }
              `,
              variables: {
                userId: loginIdentity.userId,
              },
            });
            if (securityContextResult.error)
              throw new Error('Could not generate the security context for this interaction!');

            securityContext = securityContextResult.data.securityContext;
          }

          await command.run(interaction, {
            securityContext: securityContext,
            ...context,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.log('ERROR');
            console.log(error);
            try {
              interaction.reply({ embeds: [defaultEmbed(DefaultEmbedType.Error).setDescription(error.message)] });
            } catch (error) {}
          }
        }
      }
    }
  });

  Commands.clear();
  for (const command of await loadCommands()) {
    Commands.set(command.data.name, command);
    if (command.init) await command.init(context);
  }
}
