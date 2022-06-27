import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '@src/classes/command';
import { defaultEmbed } from '@src/classes/utils';

export default <Command>{
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns ping information'),
  async run(interaction) {
    await interaction.reply({
      embeds: [
        defaultEmbed()
          .setTitle('🏓 Ping-Pong')
          .addFields(
            { name: 'Latency', value: `${Date.now() - interaction.createdTimestamp} ms`, inline: true },
            { name: 'API Ping', value: `${Math.round(interaction.client.ws.ping)} ms`, inline: true },
          ),
      ],
    });
  },
};
