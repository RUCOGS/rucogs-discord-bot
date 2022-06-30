import { gql } from '@apollo/client/core';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandContext } from '@src/classes/command';
import { defaultEmbed } from '@src/classes/utils';
import { User, UserFilterInput } from '@src/generated/model.types';
import { CropType } from '@src/services/cdn';
import { CommandInteraction, MessageAttachment } from 'discord.js';
import { got } from 'got-cjs';
import { PartialDeep } from 'type-fest';

async function search(interaction: CommandInteraction, context: CommandContext) {
  const result = await context.backend.withAuth().query<{
    users: PartialDeep<User>[];
  }>({
    query: gql`
      query DiscordBotSearchUser($filter: UserFilterInput!) {
        users(filter: $filter) {
          id
          displayName
          username
          bio
          avatarLink
          bannerLink
          createdAt
          updatedAt
          projectMembers {
            project {
              id
              name
            }
          }
          loginIdentities {
            name
            identityId
          }
        }
      }
    `,
    variables: {
      filter: <UserFilterInput>{
        username: {
          startsWith: interaction.options.getString('username'),
          mode: 'INSENSITIVE',
        },
      },
    },
  });

  const user = result.data.users[0];

  if (user !== undefined) {
    const files: MessageAttachment[] = [];

    if (user.avatarLink) {
      const thumbnailResult = await got(
        context.cdn.getFileLink(user.avatarLink, {
          width: 128,
          height: 128,
          crop: CropType.Circle,
        }),
        { responseType: 'buffer' },
      );
      files.push(new MessageAttachment(thumbnailResult.body, 'thumbnail.png'));
    }

    if (user.bannerLink) {
      const imageResult = await got(
        context.cdn.getFileLink(user.bannerLink, {
          width: 456,
          height: 256,
        }),
        { responseType: 'buffer' },
      );
      files.push(new MessageAttachment(imageResult.body, 'image.png'));
    }

    let projectsListString = '';
    for (const member of user.projectMembers ?? []) {
      projectsListString += `[${member?.project?.name}](https://cogs.club/projects/${member?.project?.id})\n`;
    }

    await interaction.reply({
      embeds: [
        defaultEmbed()
          .setTitle(user.displayName ?? '' + ', @' + user.username ?? '')
          .addFields([
            { name: 'Bio', value: user.bio ?? '' },
            { name: 'ID', value: user.id ?? '' },
            {
              name: 'Discord',
              value: `<@${user.loginIdentities?.find((x) => x?.name === 'discord')?.identityId}>`,
              inline: true,
            },
            { name: 'Link', value: `[Click Here](https://cogs.club/members/${user.username})`, inline: true },
            { name: 'Created At', value: new Date(user.createdAt).toLocaleString(), inline: true },
            { name: 'Updated At', value: new Date(user.updatedAt).toLocaleString(), inline: true },
            {
              name: 'Projects',
              value: projectsListString,
            },
          ])
          .setThumbnail('attachment://thumbnail.png')
          .setImage('attachment://image.png'),
      ],
      files,
      allowedMentions: {
        users: [],
      },
    });
  } else {
    await interaction.reply({
      embeds: [defaultEmbed().setTitle('☁️ Empty').setDescription('No results...')],
    });
  }
}

async function list(interaction: CommandInteraction, context: CommandContext) {
  const result = await context.backend.withAuth().query<{
    users: {
      displayName: string;
      username: string;
    }[];
  }>({
    query: gql`
      query DiscordBotFetchUsers($limit: Int!) {
        users(limit: $limit) {
          displayName
          username
        }
      }
    `,
    variables: {
      limit: 10,
    },
  });

  let usersListString = '';
  for (let i = 0; i < result.data.users.length; i++) {
    // prettier-ignore
    usersListString += `[${result.data.users[i].displayName} - @${result.data.users[i].username}\n](https://cogs.club/members/${result.data.users[i].username})`;
  }

  await interaction.reply({
    embeds: [defaultEmbed().setTitle('🧑‍🤝‍🧑 Members').setDescription(usersListString)],
  });
}

export default <Command>{
  data: new SlashCommandBuilder()
    .setName('members')
    .setDescription('Member related commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('Searches a member by username')
        .addStringOption((option) => option.setName('username').setDescription('Search for a username')),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List out all the members')
        .addNumberOption((option) => option.setName('page').setDescription('Current page in the list')),
    ),
  async run(interaction, context) {
    if (interaction.options.getSubcommand() === 'search') {
      search(interaction, context);
    } else if (interaction.options.getSubcommand() === 'list') {
      list(interaction, context);
    }
  },
};
