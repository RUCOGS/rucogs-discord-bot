import { SlashCommandBuilder } from '@discordjs/builders';
import { Permission, ProjectMember } from '@src/generated/graphql-endpoint.types';
import { Command, CommandContext, CommandContextInjected } from '@src/misc/command';
import { DefaultEmbedType, defaultEmbed } from '@src/misc/utils';
import { makePermsCalc } from '@src/shared/security';
import {
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  GuildChannel,
  OverwriteData,
  OverwriteResolvable,
  PermissionFlagsBits,
  PermissionOverwriteOptions,
  PermissionResolvable,
  TextChannel,
} from 'discord.js';
import { PartialDeep } from 'type-fest';

async function init(context: CommandContextInjected) {
  configSubscriptions(context);
}

async function getProjectMemberPermissionOverwriteData(
  projectId: string,
  member: PartialDeep<ProjectMember> | undefined,
  context: CommandContextInjected,
) {
  if (!member?.user?.loginIdentities || member.user.loginIdentities.length == 0) return undefined;
  const discordidentity = member.user.loginIdentities.find((x) => x?.name === 'discord');
  if (!discordidentity) return;

  const allow: PermissionResolvable[] = [];
  const deny: PermissionResolvable[] = [];
  const options = await getProjectMemberPermissionOverwriteOptions(projectId, member, context);
  for (const key in options) {
    const value = (<any>options)[key];
    if (value === true) allow.push(key as PermissionResolvable);
    else if (value === false) deny.push(key as PermissionResolvable);
  }

  return <OverwriteData>{
    id: await context.client.users.fetch(discordidentity.identityId!),
    allow,
    deny,
  };
}

async function getProjectMemberPermissionOverwriteOptions(
  projectId: string,
  member: PartialDeep<ProjectMember> | undefined,
  context: CommandContextInjected,
) {
  if (!member?.user?.loginIdentities || member.user.loginIdentities.length == 0) return undefined;

  const memberSecurityContext = await context.graphQLAPI.securityContext(member.user.id);
  const permsCalc = makePermsCalc().withContext(memberSecurityContext).withDomain({
    projectId,
  });

  return <PermissionOverwriteOptions>{
    ViewChannel: true,
    ...(permsCalc.hasPermission(Permission.ManageProjectDiscord) && {
      MentionEveryone: true,
      ManageMessages: true,
    }),
  };
}

async function configSubscriptions(context: CommandContextInjected) {
  const onCreateOrUpdate = async (member?: Partial<ProjectMember>) => {
    if (!member) return;
    const projectMember = await context.entityManager.projectMember.findOne({
      filter: {
        id: { eq: member.id },
      },
      projection: {
        project: {
          discordConfig: {
            categoryId: true,
          },
        },
        user: {
          loginIdentities: {
            name: true,
            identityId: true,
          },
        },
      },
    });
    if (!projectMember) return;

    const discordConfig = projectMember.project?.discordConfig;
    if (!discordConfig) return;
    const categoryChannel = await context.client.channels.fetch(discordConfig.categoryId!);
    if (!categoryChannel || !(categoryChannel instanceof CategoryChannel)) return;
    const discordidentity = projectMember?.user?.loginIdentities?.find((x) => x?.name === 'discord');
    if (!discordidentity) return;

    const overwrites = await getProjectMemberPermissionOverwriteOptions(
      projectMember.project!.id!,
      projectMember,
      context,
    );

    if (overwrites)
      await categoryChannel.permissionOverwrites.edit(
        await context.client.users.fetch(discordidentity.identityId!),
        overwrites,
      );
  };

  (await context.entityManager.projectMember.onCreated({ projection: { id: true } })).subscribe(onCreateOrUpdate);
  (await context.entityManager.projectMember.onUpdated({ projection: { id: true } })).subscribe(onCreateOrUpdate);

  (await context.entityManager.projectMember.onDeleted({ projection: { userId: true, projectId: true } })).subscribe(
    async (projectMember) => {
      if (!projectMember) return;

      const [identity, config] = await Promise.all([
        context.entityManager.userLoginIdentity.findOne({
          filter: { userId: { eq: projectMember.userId! } },
          projection: {
            identityId: true,
          },
        }),
        context.entityManager.projectDiscordConfig.findOne({
          filter: { projectId: { eq: projectMember.projectId } },
          projection: {
            categoryId: true,
          },
        }),
      ]);

      if (!identity || !config) return;
      const channel = await context.client.channels.fetch(config.categoryId!);
      if (!(channel instanceof CategoryChannel)) return;
      const discordUser = await context.client.users.fetch(identity.identityId!);
      await channel.permissionOverwrites.delete(discordUser);
    },
  );

  (
    await context.entityManager.project.onUpdated({
      projection: {
        id: true,
        name: true,
      },
    })
  ).subscribe(async (x) => {
    const config = await context.entityManager.projectDiscordConfig.findOne({
      filter: {
        projectId: { eq: x?.id },
      },
      projection: {
        categoryId: true,
      },
    });
    if (!config) return;
    const category = await context.client.channels.fetch(config.categoryId!);
    if (!(category instanceof CategoryChannel) || category.name === x?.name!) return;
    await category.setName(x?.name!);
  });

  context.client.on('guildMemberAdd', async (member) => {
    const result = await context.entityManager.userLoginIdentity.findOne({
      filter: {
        name: { eq: 'discord' },
        identityId: { eq: member.user.id },
      },
      projection: {
        user: {
          projectMembers: {
            id: true,
          },
        },
      },
    });
    result?.user?.projectMembers?.forEach((projectMember) => {
      onCreateOrUpdate(projectMember as Partial<ProjectMember>);
    });
  });
}

async function create(interaction: ChatInputCommandInteraction, context: CommandContext) {
  const project = await context.entityManager.project.findOne({
    projection: {
      id: true,
      name: true,
      discordConfig: {
        id: true,
      },
      members: {
        user: {
          id: true,
          loginIdentities: {
            name: true,
            identityId: true,
          },
        },
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
      projectId: project.id!,
    })
    .assertPermission(Permission.ManageProjectDiscord);

  if (!interaction.guild) return;

  let permissionOverwrites: OverwriteResolvable[] = [
    {
      id: interaction.guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
  ];
  if (project.members) {
    for (const member of project.members) {
      const overwrites = await getProjectMemberPermissionOverwriteData(project.id!, member, context);
      if (overwrites) permissionOverwrites.push(overwrites);
    }
  }

  let categoryId = interaction.options.getString('category-id') ?? '';
  if (categoryId) {
    if (
      !(
        interaction.member &&
        typeof interaction.member.permissions != 'string' &&
        interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
      )
    )
      throw new Error(
        'Missing manage channel permissions! The category-id parameter is reserved for e-board use. Did you mean to run project-discord create without category-id?',
      );
    let category = undefined;
    try {
      category = await interaction.guild.channels.fetch(categoryId);
    } catch {}
    if (!(category && category instanceof CategoryChannel))
      throw new Error(`Category of id \"${categoryId}\" doesn't exist.`);
    category.permissionOverwrites.set(permissionOverwrites);
  } else {
    const category = await interaction.guild.channels.create({
      name: project.name!.substring(0, 20),
      type: ChannelType.GuildCategory,
      permissionOverwrites,
    });
    categoryId = category.id;
    const firstChannel = await interaction.guild.channels.create({
      name: 'general',
      type: ChannelType.GuildText,
      parent: category,
    });
  }

  await context.entityManager.projectDiscordConfig.insertOne({
    record: {
      projectId: project.id!,
      categoryId: categoryId,
    },
    projection: {
      id: true,
    },
  });

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription('Discord prescence created')],
  });
}

async function archive(interaction: ChatInputCommandInteraction, context: CommandContext) {
  if (!interaction.guild) return;

  let discordConfig;
  if (interaction.options.getString('name')) {
    const project = await context.entityManager.project.findOne({
      projection: {
        name: true,
        discordConfig: {
          id: true,
          categoryId: true,
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
    if (!project.discordConfig) throw new Error(`Project "${project.name}" does not have a discord prescence!`);
    discordConfig = project.discordConfig;
  } else {
    if (!(interaction.channel instanceof TextChannel))
      throw new Error('This command must run in a guild text channel!');
    const category = interaction.channel.parent;
    if (!category) throw new Error('This command must run in a text channel under a project category!');
    discordConfig = await context.entityManager.projectDiscordConfig.findOne({
      projection: {
        id: true,
        categoryId: true,
        projectId: true,
      },
      filter: {
        categoryId: { eq: category.id },
      },
    });
    if (!discordConfig) throw new Error(`This channel is not part of a project!`);
  }

  makePermsCalc()
    .withContext(context.securityContext)
    .withDomain({
      projectId: discordConfig.projectId!,
    })
    .assertPermission(Permission.DeleteProject);

  let category = undefined;
  try {
    category = await interaction.guild.channels.fetch(discordConfig.categoryId ?? '');
  } catch {}

  let additionalDesc = '';
  if (category && category instanceof CategoryChannel) {
    await Promise.all(
      category.children.cache.map(async (channel) => await channel.setParent(context.serverConfig.archiveCategoryId)),
    );

    await category.delete();
    additionalDesc = `Category \"${category.name}\" deleted.`;
  } else {
    additionalDesc = 'No category deleted.';
  }

  await context.entityManager.projectDiscordConfig.deleteAll({
    filter: { id: { eq: discordConfig.id } },
  });

  interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription(`Discord prescence archived!\n${additionalDesc}`)],
  });
}

async function createChannel(interaction: ChatInputCommandInteraction, context: CommandContext) {
  if (!(interaction.channel instanceof TextChannel)) throw new Error('This command must run in a guild text channel!');
  const category = interaction.channel.parent;
  if (!category) throw new Error('This command must run in a text channel under a project category!');
  const discordConfig = await context.entityManager.projectDiscordConfig.findOne({
    projection: {
      id: true,
      categoryId: true,
      projectId: true,
    },
    filter: {
      categoryId: { eq: interaction.channel.parent.id },
    },
  });

  if (!discordConfig) throw new Error(`This channel is not part of a project!`);
  if (!interaction.guild) return;

  makePermsCalc()
    .withContext(context.securityContext)
    .withDomain({
      projectId: discordConfig.projectId!,
    })
    .assertPermission(Permission.ManageProjectDiscord);

  const channelTypeString = interaction.options.getString('type', true);
  const channelName = interaction.options.getString('name', true);
  const channelDescription = interaction.options.getString('description', false) ?? undefined;
  let channel;
  switch (channelTypeString) {
    case 'GUILD_TEXT':
      channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        topic: channelDescription,
      });
      break;
    case 'GUILD_VOICE':
      channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: category,
        topic: channelDescription,
      });
      break;
    default:
      throw new Error('Unknown channel type!');
  }

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription(`Channel created: ${channel.toString()}`)],
  });
}

async function deleteChannel(interaction: ChatInputCommandInteraction, context: CommandContext) {
  if (!(interaction.channel instanceof TextChannel)) throw new Error('This command must run in a guild text channel!');
  const category = interaction.channel.parent;
  if (!category) throw new Error('This command must run in a text channel under a project category!');
  const discordConfig = await context.entityManager.projectDiscordConfig.findOne({
    projection: {
      id: true,
      categoryId: true,
      projectId: true,
    },
    filter: {
      categoryId: { eq: interaction.channel.parent.id },
    },
  });

  if (!discordConfig) throw new Error(`This channel is not part of a project!`);
  if (!interaction.guild) return;

  makePermsCalc()
    .withContext(context.securityContext)
    .withDomain({
      projectId: discordConfig.projectId!,
    })
    .assertPermission(Permission.ManageProjectDiscord);

  let textChannelCount = 0;
  category.children.cache.forEach((x) => {
    if (x.type === ChannelType.GuildText) textChannelCount++;
  });
  if (textChannelCount === 1)
    throw new Error(
      'Cannot delete the last channel of a project! In order to delete a discord precense for a project, use the `/project-discord archive` command.',
    );

  const targetChannel = interaction.options.getChannel('channel', true);
  if (!(targetChannel instanceof GuildChannel) || !category.children.cache.some((x) => x.id === targetChannel.id))
    throw new Error(`Can only delete channels in this project!`);

  await targetChannel.delete();

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription(`Channel deleted: #${targetChannel.name}`)],
  });
}

const subCommands: {
  [key: string]: (interaction: ChatInputCommandInteraction, context: CommandContext) => Promise<void>;
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
        .addStringOption((option) => option.setName('name').setDescription('Name of the project').setRequired(true))
        .addStringOption((option) =>
          option
            .setName('category-id')
            .setDescription('Id of an existing category to link the project to (Reserved for e-board use)'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('archive')
        .setDescription('Archives the project that this command is ran in or the project specified.')
        .addStringOption((option) => option.setName('name').setDescription('Name of the project')),
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
        .addStringOption((option) => option.setName('name').setDescription('Name of channel').setRequired(true))
        .addStringOption((option) =>
          option.setName('description').setDescription('Description of channel').setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete-channel')
        .setDescription('Deletes a text or voice channel.')
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to delete').setRequired(true)),
    ),
  init,
  withAuth: true,
  async run(interaction, context) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) throw new Error('This command must be ran in a guild!');
    const subCommand = subCommands[interaction.options.getSubcommand()];
    if (subCommand !== undefined) await subCommand(interaction, context);
  },
};
