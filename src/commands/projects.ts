import { gql } from '@apollo/client/core';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandContext } from '@src/classes/command';
import { defaultEmbed } from '@src/classes/utils';
import { Access, Project, RoleCode } from '@src/generated/graphql-endpoint.types';
import { ProjectFilterInput } from '@src/generated/model.types';
import { CommandInteraction, MessageAttachment } from 'discord.js';
import { got } from 'got-cjs';
import { PartialDeep } from 'type-fest';

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

async function search(interaction: CommandInteraction, context: CommandContext) {
  const result = await context.backend.withAuth().query<{
    projects: PartialDeep<Project>[];
  }>({
    query: gql`
      query DiscordBotSearchProject($filter: ProjectFilterInput!) {
        projects(filter: $filter) {
          id
          name
          pitch
          description
          cardImageLink
          bannerLink
          createdAt
          updatedAt
          completedAt
          access
          tags
          members {
            user {
              displayName
              username
            }
            roles {
              roleCode
            }
          }
        }
      }
    `,
    variables: {
      filter: <ProjectFilterInput>{
        name: {
          startsWith: interaction.options.getString('name'),
          mode: 'INSENSITIVE',
        },
      },
    },
  });

  const project = result.data.projects[0];

  if (project !== undefined) {
    const owner = project.members?.find((x) => x?.roles?.some((x) => x?.roleCode === RoleCode.ProjectOwner));

    const files: MessageAttachment[] = [];

    if (project.cardImageLink) {
      const thumbnailResult = await got(
        context.cdn.getFileLink(project.cardImageLink, {
          width: 128,
          height: 128,
        }),
        { responseType: 'buffer' },
      );
      files.push(new MessageAttachment(thumbnailResult.body, 'thumbnail.png'));
    }

    if (project.bannerLink) {
      const imageResult = await got(
        context.cdn.getFileLink(project.bannerLink, {
          width: 456,
          height: 256,
        }),
        { responseType: 'buffer' },
      );
      files.push(new MessageAttachment(imageResult.body, 'image.png'));
    }

    let membersListString = '';
    for (const member of project.members ?? []) {
      membersListString += `[${member?.user?.displayName} @${member?.user?.username}](https://cogs.club/members/${member?.user?.username})`;
      if (member?.roles?.some((x) => x?.roleCode === RoleCode.ProjectOwner)) membersListString += ' 👑';
      membersListString += '\n';
    }

    await interaction.reply({
      embeds: [
        defaultEmbed()
          .setTitle(project.name!)
          .addFields([
            { name: 'Pitch', value: project.pitch ?? '' },
            ...(project.description ? [{ name: 'Description', value: project.description.substring(0, 1024) }] : []),
            { name: 'ID', value: project.id ?? '' },
            { name: 'Tags', value: project.tags?.join(', ') ?? '' },
            { name: 'Access', value: getAccessString(project.access ?? Access.Open), inline: true },
            { name: 'Link', value: `[Click Here](https://cogs.club/projects/${project.id})`, inline: true },
            { name: 'Created At', value: new Date(project.createdAt).toLocaleString(), inline: true },
            { name: 'Updated At', value: new Date(project.updatedAt).toLocaleString(), inline: true },
            ...(project.completedAt
              ? [{ name: 'Completed At', value: new Date(project.completedAt).toLocaleString(), inline: true }]
              : []),
            {
              name: 'Members',
              value: membersListString,
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

async function list(interaction: CommandInteraction, context: CommandContext) {
  const result = await context.backend.withAuth().query<{
    projects: {
      id: string;
      name: string;
    }[];
  }>({
    query: gql`
      query DiscordBotFetchProjects($limit: Int!) {
        projects(limit: $limit) {
          id
          name
        }
      }
    `,
    variables: {
      limit: 10,
    },
  });

  let projectsListString = '';
  for (let i = 0; i < result.data.projects.length; i++) {
    // prettier-ignore
    projectsListString += `[${result.data.projects[i].name}](https://cogs.club/projects/${result.data.projects[i].id})\n`;
  }

  await interaction.reply({
    embeds: [defaultEmbed().setTitle('🎦 Projects').setDescription(projectsListString)],
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
        .addStringOption((option) => option.setName('name').setDescription('Search for a name')),
    )
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List out all the projects')),
  async run(interaction, context) {
    if (interaction.options.getSubcommand() === 'search') {
      search(interaction, context);
    } else if (interaction.options.getSubcommand() === 'list') {
      list(interaction, context);
    }
  },
};
