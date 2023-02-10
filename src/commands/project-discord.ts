import { SlashCommandBuilder } from '@discordjs/builders';
import { Permission, ProjectMember } from '@src/generated/graphql-endpoint.types';
import { Command, CommandContext, CommandContextInjected } from '@src/misc/command';
import { defaultEmbed, DefaultEmbedType } from '@src/misc/utils';
import { makePermsCalc } from '@src/shared/security';
import djs, {
  CategoryChannel,
  CommandInteraction,
  GuildChannel,
  OverwriteData,
  OverwriteResolvable,
  PermissionOverwriteOptions,
  PermissionResolvable,
  TextChannel,
} from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
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
    VIEW_CHANNEL: true,
    ...(permsCalc.hasPermission(Permission.ManageProjectDiscord) && {
      MENTION_EVERYONE: true,
      MANAGE_MESSAGES: true,
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

async function create(interaction: CommandInteraction, context: CommandContext) {
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
      deny: [djs.Permissions.FLAGS.VIEW_CHANNEL],
    },
  ];
  if (project.members) {
    for (const member of project.members) {
      const overwrites = await getProjectMemberPermissionOverwriteData(project.id!, member, context);
      if (overwrites) permissionOverwrites.push(overwrites);
    }
  }

  const category = await interaction.guild.channels.create(project.name!.substring(0, 20), {
    type: ChannelTypes.GUILD_CATEGORY,
    permissionOverwrites,
  });
  const firstChannel = await interaction.guild.channels.create('general', {
    type: ChannelTypes.GUILD_TEXT,
    parent: category,
  });

  await context.entityManager.projectDiscordConfig.insertOne({
    record: {
      projectId: project.id!,
      categoryId: category.id,
    },
    projection: {
      id: true,
    },
  });

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription('Discord prescence created')],
  });
}

async function archive(interaction: CommandInteraction, context: CommandContext) {
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
      categoryId: { eq: category.id },
    },
  });

  if (!discordConfig) throw new Error(`This channel is not part of a project!`);
  if (!interaction.guild) return;

  makePermsCalc()
    .withContext(context.securityContext)
    .withDomain({
      projectId: discordConfig.projectId!,
    })
    .assertPermission(Permission.DeleteProject);

  await Promise.all(
    category.children.map(async (channel) => await channel.setParent(context.serverConfig.archiveCategoryId)),
  );

  await category.delete();

  await context.entityManager.projectDiscordConfig.deleteAll({
    filter: { id: { eq: discordConfig.id } },
  });

  interaction.reply({ embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription('Discord prescence archived!')] });
}

async function createChannel(interaction: CommandInteraction, context: CommandContext) {
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
      channel = await interaction.guild.channels.create(channelName, {
        type: channelTypeString,
        parent: category,
        topic: channelDescription,
      });
      break;
    case 'GUILD_VOICE':
      channel = await interaction.guild.channels.create(channelName, {
        type: channelTypeString,
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

async function deleteChannel(interaction: CommandInteraction, context: CommandContext) {
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
  category.children.forEach((x) => {
    if (x.type === 'GUILD_TEXT') textChannelCount++;
  });
  if (textChannelCount === 1)
    throw new Error(
      'Cannot delete the last channel of a project! In order to delete a discord precense for a project, use the `/project-discord archive` command.',
    );

  const targetChannel = interaction.options.getChannel('channel', true);
  if (!(targetChannel instanceof GuildChannel) || !category.children.some((x) => x.id === targetChannel.id))
    throw new Error(`Can only delete channels in this project!`);

  await targetChannel.delete();

  await interaction.reply({
    embeds: [defaultEmbed(DefaultEmbedType.Success).setDescription(`Channel deleted: #${targetChannel.name}`)],
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
    if (!interaction.guild) throw new Error('This command must be ran in a guild!');
    const subCommand = subCommands[interaction.options.getSubcommand()];
    if (subCommand !== undefined) await subCommand(interaction, context);
  },
};
