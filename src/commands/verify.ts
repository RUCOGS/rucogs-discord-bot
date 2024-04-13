import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '@src/misc/command';
import { defaultEmbed } from '@src/misc/utils';
import { GuildMember } from 'discord.js';

export default <Command>{
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Run this command to verify you\'re are a human'),
  withAuth: true,
  async run(interaction, context) {
    let member = interaction.member as GuildMember;
    if (member.roles.cache.some((role) => role.id == context.serverConfig.playerRoleId)) {
      await interaction.reply({
        embeds: [
          defaultEmbed()
            .setTitle('✅ Already Verified')
            .setDescription(`<@${interaction.user.id}> is already verified!`),
        ],
      });
      return;
    }
    await member.roles.add(context.serverConfig.playerRoleId);
    await interaction.reply({
      embeds: [defaultEmbed().setTitle('✅ Verified').setDescription(`<@${interaction.user.id}> is now verified!`)],
    });
  },
};
