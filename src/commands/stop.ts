import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '@src/classes/command';
import { defaultEmbed } from '@src/classes/utils';

export default <Command>{
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the bot.'),
  async run(interaction, context) {
    await interaction.reply({
      embeds: [defaultEmbed().setTitle('🛑 Stoped').setDescription('Bot has been stopped.')],
    });
    context.client.destroy();
    process.exit();
  },
};
