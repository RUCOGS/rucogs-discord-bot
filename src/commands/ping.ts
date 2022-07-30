import { SlashCommandBuilder } from '@discordjs/builders';
import { Permission } from '@src/generated/graphql-endpoint.types';
import { Command } from '@src/misc/command';
import { defaultEmbed } from '@src/misc/utils';
import { makePermsCalc } from '@src/shared/security';

export default <Command>{
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns ping information'),
  withAuth: true,
  async run(interaction, context) {
    makePermsCalc().withContext(context.securityContext).assertPermission(Permission.DebugDiscordBot);
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
