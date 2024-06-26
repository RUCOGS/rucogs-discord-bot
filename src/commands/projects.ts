import { SlashCommandBuilder } from '@discordjs/builders';
import { Access, RoleCode } from '@src/generated/graphql-endpoint.types';
import { Command, CommandContext } from '@src/misc/command';
import { defaultEmbed } from '@src/misc/utils';
import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
import { got } from 'got-cjs';

function getAccessString(access: Access) {
  switch (access) {
    case Access.Closed:
      return '❌ Closed';
    case Access.Invite:
      return '✉️ Invite';
    case Access.Open:
      return '✅ Open';
    default:
      return 'Unknown';
  }
}

async function search(interaction: ChatInputCommandInteraction, context: CommandContext) {
  const project = await context.entityManager.project.findOne({
    projection: {
      id: true,
      name: true,
      pitch: true,
      description: true,
      cardImageLink: true,
      bannerLink: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      access: true,
      tags: true,
      members: {
        user: {
          displayName: true,
          username: true,
        },
        roles: {
          roleCode: true,
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

  if (project !== undefined) {
    const files: AttachmentBuilder[] = [];

    if (project.cardImageLink) {
      const thumbnailResult = await got(
        context.cdn.getFileLink(project.cardImageLink, {
          width: 128,
          height: 128,
        }),
        { responseType: 'buffer' },
      );
      files.push(new AttachmentBuilder(thumbnailResult.body, { name: 'thumbnail.png' }));
    }

    if (project.bannerLink) {
      const imageResult = await got(
        context.cdn.getFileLink(project.bannerLink, {
          width: 456,
          height: 256,
        }),
        { responseType: 'buffer' },
      );
      files.push(new AttachmentBuilder(imageResult.body, { name: 'image.png' }));
    }

    let membersListString = '';
    for (const member of project.members?.slice(0, 10) ?? []) {
      membersListString += `[${member?.user?.displayName} @${member?.user?.username}](https://cogs.club/members/${member?.user?.username})`;
      if (member?.roles?.some((x) => x?.roleCode === RoleCode.ProjectOwner)) membersListString += ' 👑';
      membersListString += '\n';
    }

    await interaction.reply({
      embeds: [
        defaultEmbed()
          .setTitle(project.name!)
          .addFields([
            { name: 'Pitch', value: project.pitch?.substring(0, 1024) ?? '*Empty*' },
            ...(project.description ? [{ name: 'Description', value: project.description.substring(0, 1024) }] : []),
            { name: 'ID', value: project.id ?? '*Empty*' },
            { name: 'Tags', value: project.tags?.join(', ') ?? '*Empty*' },
            { name: 'Access', value: getAccessString(project.access ?? Access.Open), inline: true },
            { name: 'Link', value: `[Click Here](https://cogs.club/projects/${project.id})`, inline: true },
            { name: 'Created At', value: new Date(project.createdAt).toLocaleString(), inline: true },
            { name: 'Updated At', value: new Date(project.updatedAt).toLocaleString(), inline: true },
            ...(project.completedAt
              ? [{ name: 'Completed At', value: new Date(project.completedAt).toLocaleString(), inline: true }]
              : []),
            {
              name: 'Members',
              value: membersListString.substring(0, 1024),
            },
          ])
          .setThumbnail('attachment://thumbnail.png')
          .setImage('attachment://image.png'),
      ],
      files,
    });
  } else {
    await interaction.reply({
      embeds: [defaultEmbed().setTitle('☁️ Empty').setDescription('No results...')],
    });
  }
}

async function list(interaction: ChatInputCommandInteraction, context: CommandContext) {
  const page = interaction.options.getNumber('page') ?? 1;
  const itemsPerPage = 10;
  const projects = await context.entityManager.project.findAll({
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
    projection: {
      id: true,
      name: true,
    },
  });
  const projectCount = await context.entityManager.project.count();
  const pageCount = Math.ceil(projectCount / itemsPerPage);

  let projectsListString = '';
  for (let i = 0; i < projects.length; i++) {
    // prettier-ignore
    projectsListString += `[${projects[i].name}](https://cogs.club/projects/${projects[i].id})\n`;
  }

  await interaction.reply({
    embeds: [
      defaultEmbed()
        .setTitle('🎦 Projects')
        .setDescription(projectsListString)
        .addFields({ name: 'Page', value: `${page}/${pageCount}` }),
    ],
  });
}

export default <Command>{
  data: new SlashCommandBuilder()
    .setName('projects')
    .setDescription('Project related commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('Searches a project by name')
        .addStringOption((option) => option.setName('name').setDescription('Searched name').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List out all the projects')
        .addNumberOption((option) =>
          option.setName('page').setDescription('Current page in the list').setRequired(false).setMinValue(1),
        ),
    ),
  async run(interaction, context) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.options.getSubcommand() === 'search') {
      search(interaction, context);
    } else if (interaction.options.getSubcommand() === 'list') {
      list(interaction, context);
    }
  },
};
