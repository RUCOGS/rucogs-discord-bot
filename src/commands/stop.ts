import { SlashCommandBuilder } from '@discordjs/builders';
import { Permission } from '@src/generated/graphql-endpoint.types';
import { Command } from '@src/misc/command';
import { defaultEmbed } from '@src/misc/utils';
import { makePermsCalc } from '@src/shared/security';

export default <Command>{
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the bot.'),
  withAuth: true,
  async run(interaction, context) {
    makePermsCalc().withContext(context.securityContext).assertPermission(Permission.DebugDiscordBot);
    await interaction.reply({
      embeds: [defaultEmbed().setTitle('🛑 Stoped').setDescription('Bot has been stopped.')],
    });
    context.client.destroy();
    process.exit();
  },
};
