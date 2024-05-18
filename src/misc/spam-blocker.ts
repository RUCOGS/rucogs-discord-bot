import { BaseGuildTextChannel, Client, Message, PermissionFlagsBits, Snowflake, TextBasedChannel } from 'discord.js';
import { defaultEmbed } from './utils';
import { ServerConfig } from './config';
import { Server } from 'http';

// A message a user sent
interface TrackedMessage {
  messageId: Snowflake;
  channelId: Snowflake;
}

// A group of similar messages a user sent
interface TrackedMessageGroups {
  content: string; // Latest message sent by user
  time: number; // Time message was created
  count: number; // Number of times message was sent
  trackedMessages: TrackedMessage[]; // Tracked messages
}

// Number of times user sent a discord link
interface TrackedDiscordLinks {
  time: number; // Time message was created
  count: number; // Number of times message was sent
  trackedMessages: TrackedMessage[]; // Tracked messages
}

// Stores the last message the user sent in different channels
interface TrackedUser {
  // Tracked messages
  messageGroups: TrackedMessageGroups[];
  discordLinks?: TrackedDiscordLinks;
}

let trackedUserCache: {
  [userId: Snowflake]: TrackedUser;
} = {};

function instanceOfTrackedMessageGroups(obj: any): obj is TrackedMessageGroups {
  return 'content' in obj && 'time' in obj && 'count' in obj && 'trackedMessages' in obj;
}

function instanceOfDiscordLinks(obj: any): obj is TrackedDiscordLinks {
  return 'time' in obj && 'count' in obj && 'trackedMessages' in obj;
}

// Oldest message to track, in milliseconds.
const TRACKED_MESSAGE_DURATION = 1000 * 60 * 60; // 1 hour
// Number of times the same message can be sent in before the user gets banned.
const MESSAGE_SPAM_LIMIT = 3;
// Number of times the same message can be sent in before the user gets warned.
// Disable warning for now, to autoban manual spammer.
const MESSAGE_WARN_LIMIT = -1;
// Minimum size of messages that will be processed by the spam blocker.
const TRACKED_MESSAGE_MIN_LENGTH = 64;
// Maximum number of messages to track from a user.
const TRACKED_MESSAGE_MAX_COUNT = 3;
// Regex that detects a link. Linked messages are instantly tracked.
const LINK_REGEX = new RegExp(/(http|https):\/\/.*/);
// Regex that detects a discord link. Discord links are tracked separately
const DISCORD_LINK_REGEX = new RegExp(/discord.gg\/.*/);

export function configSpamBlocker(client: Client, serverConfig: ServerConfig) {
  client.on('messageCreate', async (message) => {
    let isDiscordLink = DISCORD_LINK_REGEX.test(message.content);
    if (message.author.id == client.user?.id || message.member?.permissions.has(PermissionFlagsBits.Administrator))
      return;
    if (!LINK_REGEX.test(message.content) && !isDiscordLink && message.content.length < TRACKED_MESSAGE_MIN_LENGTH)
      return;
    let trackedUser = trackedUserCache[message.author.id];
    if (trackedUser === undefined) {
      trackedUserCache[message.author.id] = {
        messageGroups: [],
      };
      trackedUser = trackedUserCache[message.author.id];
    }
    if (isDiscordLink) {
      // Track discord links
      if (!trackedUser.discordLinks) {
        trackedUser.discordLinks = {
          count: 0,
          time: Date.now(),
          trackedMessages: [],
        };
      }
      trackedUser.discordLinks.count += 1;
      trackedUser.discordLinks.trackedMessages.push({
        messageId: message.id,
        channelId: message.channelId,
      });
    } else {
      // Track long messages/messages with links
      let existingTrackedMessage = trackedUser.messageGroups.find((x) => x.content == message.content);
      if (!existingTrackedMessage) {
        if (trackedUser.messageGroups.length == TRACKED_MESSAGE_MAX_COUNT) {
          // Kick out the oldest message
          let oldest_message_idx = 0;
          for (let i = 0; i < trackedUser.messageGroups.length; i++) {
            if (trackedUser.messageGroups[i].time < trackedUser.messageGroups[oldest_message_idx].time) {
              oldest_message_idx = i;
            }
          }
          trackedUser.messageGroups.splice(oldest_message_idx, 1);
        }
        // Add new message
        existingTrackedMessage = {
          content: message.content,
          count: 0,
          time: Date.now(),
          trackedMessages: [],
        };
        trackedUser.messageGroups.push(existingTrackedMessage);
      }
      existingTrackedMessage.count += 1;
      existingTrackedMessage.trackedMessages.push({
        messageId: message.id,
        channelId: message.channelId,
      });
    }
    cleanMessageCache();
    await processAction(message, trackedUser, client, serverConfig);
  });
}

// Ban or warn client
async function processAction(
  message: Message<boolean>,
  trackedUser: TrackedUser,
  client: Client,
  serverConfig: ServerConfig,
) {
  let mostSpammedMessage: TrackedMessageGroups | TrackedDiscordLinks | undefined;
  for (let message of trackedUser.messageGroups) {
    if (!mostSpammedMessage || message.count > mostSpammedMessage.count) mostSpammedMessage = message;
  }
  if (!mostSpammedMessage || (trackedUser.discordLinks && trackedUser.discordLinks.count > mostSpammedMessage.count)) {
    mostSpammedMessage = trackedUser.discordLinks;
  }
  if (!mostSpammedMessage) return;
  if (mostSpammedMessage.count >= MESSAGE_SPAM_LIMIT) {
    await message.member?.ban({
      reason: 'Spamming',
    });
    let trackedMessagesByChannelId: { [category: Snowflake]: Snowflake[] } = {};
    if (trackedUser.discordLinks)
      for (let message of trackedUser.discordLinks.trackedMessages) {
        if (!(message.channelId in trackedMessagesByChannelId)) trackedMessagesByChannelId[message.channelId] = [];
        trackedMessagesByChannelId[message.channelId].push(message.messageId);
      }
    for (let trackedMessageGroup of trackedUser.messageGroups)
      for (let message of trackedMessageGroup.trackedMessages) {
        if (!(message.channelId in trackedMessagesByChannelId)) trackedMessagesByChannelId[message.channelId] = [];
        trackedMessagesByChannelId[message.channelId].push(message.messageId);
      }
    for (let channelId in trackedMessagesByChannelId) {
      let channel = message.guild?.channels.cache.get(channelId);
      if (channel instanceof BaseGuildTextChannel) {
        let messageIds = trackedMessagesByChannelId[channelId];
        await channel.bulkDelete(messageIds);
      }
    }
    delete trackedUserCache[message.author.id];
    let loggingChannel = client.channels.cache.get(serverConfig.loggingChannelId) as TextBasedChannel;
    let reason = '';
    let fields = [];
    if (instanceOfTrackedMessageGroups(mostSpammedMessage)) {
      fields.push({ name: 'Reason', value: 'Spammed text' });
      fields.push({ name: 'Text', value: mostSpammedMessage.content });
    } else {
      fields.push({ name: 'Reason', value: 'Discord links' });
    }
    await loggingChannel.send({
      embeds: [
        defaultEmbed()
          .setTitle('🔨 User Banned')
          .setDescription(`<@${message.author.id}> has been banned for spamming.`)
          .setFields(fields),
      ],
    });
  } else if (mostSpammedMessage.count == MESSAGE_WARN_LIMIT) {
    message.reply({
      embeds: [
        defaultEmbed()
          .setTitle('⚠️ Stop Sending Messages')
          .setDescription(
            `Attention <@${message.author.id}>, you are sending too many messages! If you send any more, you may be banned.`,
          ),
      ],
    });
  }
}

// Removes old messages from message cache
function cleanMessageCache() {
  let now = Date.now();
  let toDeleteUserIds = [];
  for (let userId in trackedUserCache) {
    let trackedUser = trackedUserCache[userId];
    trackedUser.messageGroups = trackedUser.messageGroups.filter((x) => now - x.time <= TRACKED_MESSAGE_DURATION);
    if (trackedUser.discordLinks && now - trackedUser.discordLinks.time > TRACKED_MESSAGE_DURATION) {
      trackedUser.discordLinks = undefined;
    }
    if (trackedUser.messageGroups.length == 0 && !trackedUser.discordLinks) {
      toDeleteUserIds.push(userId);
    }
  }
  for (let userId of toDeleteUserIds) {
    delete trackedUserCache[userId];
  }
}
