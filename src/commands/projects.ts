import { gql } from '@apollo/client/core';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandContext } from '@src/classes/command';
import { defaultEmbed } from '@src/classes/utils';
import { RoleCode } from '@src/generated/graphql-endpoint.types';
import { ProjectFilterInput } from '@src/generated/model.types';
import { CommandInteraction } from 'discord.js';

async function search(interaction: CommandInteraction, context: CommandContext) {
  const result = await context.backend.withAuth().query<{
    projects: {
      id: string;
      name: string;
      pitch: string;
      description: string;
      cardImageLink: string;
      bannerLink: string;
      createdAt: number;
      updatedAt: number;
      completedAt: number;
      members: {
        user: {
          username: string;
          avatarLink: string;
        };
        roles: {
          roleCode: RoleCode;
        }[];
      }[];
    }[];
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
          members {
            user {
              username
              avatarLink
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
    const owner = project.members.find((x) => x.roles.some((x) => x.roleCode === RoleCode.ProjectOwner));

    await interaction.reply({
      embeds: [
        defaultEmbed()
          .setTitle(project.name)
          .addFields([
            { name: 'Pitch', value: project.pitch },
            ...(project.description ? [{ name: 'Description', value: project.description.substring(0, 1024) }] : []),
            { name: 'ID', value: project.id },
          ])
          .addFields([
            { name: 'Created At', value: new Date(project.createdAt).toLocaleString(), inline: true },
            { name: 'Updated At', value: new Date(project.updatedAt).toLocaleString(), inline: true },
            ...(project.completedAt
              ? [{ name: 'Completed At', value: new Date(project.completedAt).toLocaleString(), inline: true }]
              : []),
          ])
          .setThumbnail(
            context.cdn.getFileLink(project.cardImageLink, {
              width: 128,
              height: 128,
            }),
          )
          .setImage(
            context.cdn.getFileLink(project.bannerLink, {
              width: 256,
              height: 456,
            }),
          )
          .setAuthor({ name: owner?.user.username ?? '', iconURL: context.cdn.getFileLink(owner?.user.avatarLink) }),
      ],
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
      name: string;
    }[];
  }>({
    query: gql`
      query DiscordBotFetchProjects($limit: Int!) {
        projects(limit: $limit) {
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
    projectsListString += `#${i + 1}: ${result.data.projects[i].name}\n`;
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
