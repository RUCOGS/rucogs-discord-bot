import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandContext } from '@src/classes/command';
import { makePermsCalc } from '@src/shared/security';
import { CommandInteraction } from 'discord.js';

async function create(interaction: CommandInteraction, context: CommandContext) {
  const project = context.backend.query({});

  makePermsCalc().withContext(context.securityContext).withDomain({
    projectId: [],
  });
}

async function archive(interaction: CommandInteraction, context: CommandContext) {}

async function createTextChannel(interaction: CommandInteraction, context: CommandContext) {}

async function deleteTextChannel(interaction: CommandInteraction, context: CommandContext) {}

async function createVoiceChannel(interaction: CommandInteraction, context: CommandContext) {}

async function deleteVoiceChannel(interaction: CommandInteraction, context: CommandContext) {}

const subCommands: {
  [key: string]: (interaction: CommandInteraction, context: CommandContext) => Promise<void>;
} = {
  create: create,
  archive: archive,
  'create-text-channel': createTextChannel,
  'delete-text-channel': deleteTextChannel,
  'create-voice-channel': createVoiceChannel,
  'delete-voice-channel': deleteVoiceChannel,
};

export default <Command>{
  data: new SlashCommandBuilder()
    .setName('project-discord')
    .setDescription('Project discord related commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Creates a Discord presence for a project')
        .addStringOption((option) => option.setName('project name').setDescription('Name of the project')),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('archive').setDescription('Archives the project that this command is ran in.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create-text-channel')
        .setDescription('Creates a text-channel.')
        .addStringOption((option) => option.setName('channel name').setDescription('Name of the text-channel')),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete-text-channel')
        .setDescription('Deletes a text-channel.')
        .addStringOption((option) => option.setName('channel name').setDescription('Name of the text-channel')),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create-voice-channel')
        .setDescription('Creates a voice-channel.')
        .addStringOption((option) => option.setName('channel name').setDescription('Name of the voice-channel')),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete-voice-channel')
        .setDescription('Deletes a voice-channel.')
        .addStringOption((option) => option.setName('channel name').setDescription('Name of the voice-channel')),
    ),
  async run(interaction, context) {
    const subCommand = subCommands[interaction.options.getSubcommand()];
    if (subCommand !== undefined) subCommand(interaction, context);
  },
};
