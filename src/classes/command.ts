import { gql } from '@apollo/client';
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { createUnsecureEntityManager } from '@src/controllers/entity-manager.controller';
import { UserLoginIdentityFilterInput } from '@src/generated/model.types';
import { EntityManager } from '@src/generated/typetta';
import { CdnService } from '@src/services/cdn';
import { ProjectService } from '@src/services/project';
import { DefaultSecurityContext, SecurityContext } from '@src/shared/security';
import { Client, CommandInteraction, Interaction } from 'discord.js';
import { glob } from 'glob';
import { Db } from 'mongodb';
import path from 'path';
import { BackendService } from '../services/backend';
import { defaultEmbed, DefaultEmbedType } from './utils';

export interface CommandContext extends CommandContextServices {
  client: Client;
  securityContext: SecurityContext;
  unsecureEntityManager: EntityManager;
}

export interface CommandContextServices {
  backend: BackendService;
  project: ProjectService;
  cdn: CdnService;
}

export interface Command {
  withAuth?: boolean;
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
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

export async function configCommands(client: Client, mongoDb: Db | 'mock', context: CommandContextServices) {
  client.on('interactionCreate', async (interaction: Interaction) => {
    const unsecureEntityManager = createUnsecureEntityManager(mongoDb);
    if (interaction.isCommand()) {
      const command = Commands.get(interaction.commandName);
      if (command) {
        try {
          let securityContext: SecurityContext = DefaultSecurityContext;
          if (command.withAuth) {
            const loginIdentityResult = await context.backend.withAuth().query<{
              userLoginIdentitys: {
                userId: string;
              }[];
            }>({
              query: gql`
                query GetInteractionUserLoginIdentity($filter: UserLoginIdentityFilterInput!) {
                  userLoginIdentitys(filter: $filter) {
                    userId
                  }
                }
              `,
              variables: {
                filter: <UserLoginIdentityFilterInput>{
                  name: { eq: 'discord' },
                  identityId: { eq: interaction.user.id },
                },
              },
            });
            if (loginIdentityResult.error || loginIdentityResult.data.userLoginIdentitys.length === 0)
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
                userId: loginIdentityResult.data.userLoginIdentitys[0].userId,
              },
            });
            if (securityContextResult.error)
              throw new Error('Could not generate the security context for this interaction!');

            securityContext = securityContextResult.data.securityContext;
          }

          await command.run(interaction, {
            client,
            unsecureEntityManager,
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
  }
}
