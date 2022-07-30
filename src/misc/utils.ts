import { Client, MessageEmbed } from 'discord.js';

export enum DefaultEmbedType {
  Default,
  Attention,
  Success,
  Error,
}

let client: Client;

export function configUtils(newClient: Client) {
  client = newClient;
}

export function defaultEmbed(type: DefaultEmbedType = DefaultEmbedType.Default) {
  const embed = new MessageEmbed()
    .setColor('#B3002D')
    .setTimestamp()
    .setFooter({
      text: client.user?.username ?? '',
      iconURL: client.user?.avatarURL({ size: 128 }) ?? '',
    });

  switch (type) {
    case DefaultEmbedType.Attention:
      embed.setTitle('‼️ Attention');
      break;
    case DefaultEmbedType.Success:
      embed.setTitle('✅ Success');
      break;
    case DefaultEmbedType.Error:
      embed.setTitle('🛑 Error');
      break;
    case DefaultEmbedType.Default:
    default:
      break;
  }
  return embed;
}
