import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CdnService } from '@src/services/cdn';
import { Client, CommandInteraction, Interaction } from 'discord.js';
import { glob } from 'glob';
import path from 'path';
import { BackendService } from '../services/backend';
import { defaultEmbed, DefaultEmbedType } from './utils';

export interface CommandContext {
  client: Client;
  backend: BackendService;
  cdn: CdnService;
}

export interface Command {
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

export async function configCommands(client: Client, backend: BackendService, cdn: CdnService) {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      const command = Commands.get(interaction.commandName);
      if (command) {
        try {
          await command.run(interaction, <CommandContext>{
            client,
            backend,
            cdn,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.log('ERROR');
            console.log(error);
            interaction.reply({ embeds: [defaultEmbed(DefaultEmbedType.Error).setDescription(error.message)] });
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
