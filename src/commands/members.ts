import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandContext } from '@src/misc/command';
import { defaultEmbed } from '@src/misc/utils';
import { CropType } from '@src/services/cdn';
import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
import { got } from 'got-cjs';

async function search(interaction: ChatInputCommandInteraction, context: CommandContext) {
  const user = await context.entityManager.user.findOne({
    projection: {
      id: true,
      displayName: true,
      username: true,
      bio: true,
      avatarLink: true,
      bannerLink: true,
      createdAt: true,
      updatedAt: true,
      projectMembers: {
        project: {
          id: true,
          name: true,
        },
      },
      loginIdentities: {
        name: true,
        identityId: true,
      },
    },
    filter: {
      username: {
        startsWith: interaction.options.getString('username'),
        mode: 'INSENSITIVE',
      },
    },
  });

  if (user !== undefined) {
    const files: AttachmentBuilder[] = [];

    if (user.avatarLink) {
      const thumbnailResult = await got(
        context.cdn.getFileLink(user.avatarLink, {
          width: 128,
          height: 128,
          crop: CropType.Circle,
        }),
        { responseType: 'buffer' },
      );
      files.push(new AttachmentBuilder(thumbnailResult.body, { name: 'thumbnail.png' }));
    }

    if (user.bannerLink) {
      const imageResult = await got(
        context.cdn.getFileLink(user.bannerLink, {
          width: 456,
          height: 256,
        }),
        { responseType: 'buffer' },
      );
      files.push(new AttachmentBuilder(imageResult.body, { name: 'image.png' }));
    }

    let projectsListString = '';
    for (const member of user.projectMembers ?? []) {
      projectsListString += `[${member?.project?.name}](https://cogs.club/projects/${member?.project?.id})\n`;
    }

    await interaction.reply({
      embeds: [
        defaultEmbed()
          .setTitle(user.displayName ?? '*Empty*' + ', @' + user.username ?? '*Empty*')
          .addFields([
            { name: 'Bio', value: user.bio ?? '*Empty*' },
            { name: 'ID', value: user.id ?? '*Empty*' },
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

async function list(interaction: ChatInputCommandInteraction, context: CommandContext) {
  const page = interaction.options.getNumber('page') ?? 1;
  const itemsPerPage = 10;
  const users = await context.entityManager.user.findAll({
    skip: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
    projection: {
      id: true,
      displayName: true,
      username: true,
    },
  });
  const usersCount = await context.entityManager.user.count();
  const pageCount = Math.ceil(usersCount / itemsPerPage);

  let usersListString = '';
  for (let i = 0; i < users.length; i++) {
    // prettier-ignore
    usersListString += `[${users[i].displayName} - @${users[i].username}\n](https://cogs.club/members/${users[i].username})`;
  }

  await interaction.reply({
    embeds: [
      defaultEmbed()
        .setTitle('🧑‍🤝‍🧑 Members')
        .setDescription(usersListString)
        .addFields({ name: 'Page', value: `${page}/${pageCount}` }),
    ],
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
        .addStringOption((option) => option.setName('username').setDescription('Searched username').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List out all the members')
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
