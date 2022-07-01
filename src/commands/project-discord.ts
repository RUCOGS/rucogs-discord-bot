import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandContext } from '@src/classes/command';
import { defaultEmbed, DefaultEmbedType } from '@src/classes/utils';
import { Permission } from '@src/generated/graphql-endpoint.types';
import { makePermsCalc } from '@src/shared/security';
import { CommandInteraction, GuildChannel } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

async function create(interaction: CommandInteraction, context: CommandContext) {
  const project = await context.entityManager.project.findOne({
    projection: {
      id: true,
      name: true,
      discordConfig: {
        id: true,
      },
    },
    filter: {
      name: {
        startsWith: interaction.options.getString('name'),
        mode: 'INSENSITIVE',
      },
    },
  });
  if (!project) throw new Error(`Project couldn't be found!`);
  if (project.discordConfig) throw new Error(`Project "${project.name}" already has a discord prescence!`);

  makePermsCalc()
    .withContext(context.securityContext)
    .withDomain({
      projectId: [project.id!],
    })
    .assertPermission(Permission.UpdateProject);

  if (!interaction.guild) return;

  const category = await interaction.guild.channels.create(project.name!.substring(0, 20), {
    type: ChannelTypes.GUILD_CATEGORY,
  });
  const firstChannel = await interaction.guild.channels.create('general');
  await firstChannel.setParent(category);

  await context.entityManager.projectDiscordConfig.insertOne({
    record: {
      projectId: project.id!,
      categoryId: category.id,
      textChannelIds: [firstChannel.id],
      voiceChannelIds: [],
    },
  });

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription('Discord prescence created')],
  });
}

async function archive(interaction: CommandInteraction, context: CommandContext) {
  const discordConfig = await context.entityManager.projectDiscordConfig.findOne({
    projection: {
      id: true,
      categoryId: true,
      textChannelIds: true,
      voiceChannelIds: true,
      project: {
        id: true,
      },
    },
    filter: {
      textChannelIds: { contains: interaction.channelId },
    },
  });

  if (!discordConfig) throw new Error(`This channel is not part of a project!`);

  makePermsCalc()
    .withContext(context.securityContext)
    .withDomain({
      projectId: [discordConfig.projectId!],
    })
    .assertPermission(Permission.DeleteProject);

  if (!interaction.guild || !discordConfig.categoryId) return;

  const category = await interaction.guild.channels.cache.get(discordConfig.categoryId);
  if (!category) return;

  if (discordConfig.textChannelIds) {
    for (const channelId of discordConfig.textChannelIds) {
      if (!channelId) continue;
      const channel = await interaction.guild.channels.cache.get(channelId);
      if (channel instanceof GuildChannel) channel.setParent(context.serverConfig.archiveCategoryId);
    }
  }

  if (discordConfig.voiceChannelIds) {
    for (const channelId of discordConfig.voiceChannelIds) {
      if (!channelId) continue;
      const channel = await interaction.guild.channels.cache.get(channelId);
      if (channel instanceof GuildChannel) channel.setParent(context.serverConfig.archiveCategoryId);
    }
  }

  await category.delete();

  await context.entityManager.projectDiscordConfig.deleteAll({
    filter: { id: { eq: discordConfig.id } },
  });

  interaction.reply({ embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription('Discord prescence archived!')] });
}

async function createChannel(interaction: CommandInteraction, context: CommandContext) {
  const discordConfig = await context.entityManager.projectDiscordConfig.findOne({
    projection: {
      id: true,
      categoryId: true,
      textChannelIds: true,
      voiceChannelIds: true,
    },
    filter: {
      textChannelIds: { contains: interaction. },
    },
  });
  // TODO NOW: Make special endpoint in backend for finding discordConfig based on textChannelId

  if (!discordConfig) throw new Error(`This channel is not part of a project!`);
  if (!interaction.guild) return;

  const changes = {
    textChannelIds: (discordConfig.textChannelIds?.slice() as string[]) ?? [],
    voiceChannelIds: (discordConfig.voiceChannelIds?.slice() as string[]) ?? [],
  };

  const channelTypeString = interaction.options.getString('type') ?? '';
  const channelName = interaction.options.getString('name') ?? '';
  let channel;
  let channelMentionString = '';
  switch (channelTypeString) {
    case 'GUILD_TEXT':
      channel = await interaction.guild.channels.create(channelName, { type: channelTypeString });
      channelMentionString = channel.toString();
      changes.textChannelIds.push(channelName);
      break;
    case 'GUILD_VOICE':
      channel = await interaction.guild.channels.create(channelName, { type: channelTypeString });
      channelMentionString = channel.toString();
      changes.voiceChannelIds.push(channelName);
      break;
    default:
      throw new Error('Unknown channel type!');
  }

  await context.entityManager.projectDiscordConfig.updateAll({
    filter: { id: { eq: discordConfig.id } },
    changes,
  });

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription(`Channel created: ${channelMentionString}`)],
  });
}

async function deleteChannel(interaction: CommandInteraction, context: CommandContext) {
  const discordConfig = await context.entityManager.projectDiscordConfig.findOne({
    projection: {
      id: true,
      categoryId: true,
      textChannelIds: true,
    },
    filter: {
      textChannelIds: { contains: interaction.channelId },
    },
  });

  if (!discordConfig) throw new Error(`This channel is not part of a project!`);
  if (!interaction.guild) return;

  const updatedTextChannels = (discordConfig.textChannelIds as string[]).slice();
  const index = updatedTextChannels.indexOf(interaction.options.getString('name')!);
  if (index < 0) throw new Error(``);
  const deleteChannelId = updatedTextChannels.splice(index, 1)[0];

  await context.entityManager.projectDiscordConfig.updateAll({
    filter: { id: { eq: discordConfig.id! } },
    changes: {
      textChannelIds: updatedTextChannels,
    },
  });

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription(`Channel deleted: ${deleteChannelId}`)],
  });
}

const subCommands: {
  [key: string]: (interaction: CommandInteraction, context: CommandContext) => Promise<void>;
} = {
  create: create,
  archive: archive,
  'create-channel': createChannel,
  'delete-channel': deleteChannel,
};

export default <Command>{
  data: new SlashCommandBuilder()
    .setName('project-discord')
    .setDescription('Project discord related commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Creates a Discord presence for a project')
        .addStringOption((option) => option.setName('name').setDescription('Name of the project').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('archive').setDescription('Archives the project that this command is ran in.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create-channel')
        .setDescription('Creates a channel.')
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('Type of channel')
            .addChoices({ name: 'Text', value: 'GUILD_TEXT' }, { name: 'Voice', value: 'GUILD_VOICE' })
            .setRequired(true),
        )
        .addStringOption((option) => option.setName('name').setDescription('Name of channel')),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete-channel')
        .setDescription('Deletes a text or voice channel.')
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to delete').setRequired(false)),
    ),
  withAuth: true,
  async run(interaction, context) {
    if (!interaction.guild) throw new Error('This command must be ran in a guild!');
    const subCommand = subCommands[interaction.options.getSubcommand()];
    if (subCommand !== undefined) await subCommand(interaction, context);
  },
};
