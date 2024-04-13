import { Client, Message, PermissionFlagsBits, Snowflake } from 'discord.js';
import { defaultEmbed } from './utils';

// A message a user sent
interface TrackedMessage {
  content: string; // Latest message sent by user
  time: number; // Time message was created
  count: number; // Number of times message was sent
}

// Number of times user sent a discord link
interface TrackedDiscordLinks {
  time: number; // Time message was created
  count: number; // Number of times message was sent
}

// Stores the last message the user sent in different channels
interface TrackedUser {
  // Tracked messages
  messages: TrackedMessage[];
  discord_links?: TrackedDiscordLinks;
}

let trackedUserCache: {
  [userId: Snowflake]: TrackedUser;
} = {};

// Oldest message to track, in milliseconds.
const TRACKED_MESSAGE_DURATION = 1000 * 60 * 60; // 1 hour
// Number of times the same message can be sent in before the user gets banned.
const MESSAGE_SPAM_LIMIT = 5;
// Number of times the same message can be sent in before the user gets warned.
const MESSAGE_WARN_LIMIT = 3;
// Minimum size of messages that will be processed by the spam blocker.
const TRACKED_MESSAGE_MIN_LENGTH = 24;
// Maximum number of messages to track from a user.
const TRACKED_MESSAGE_MAX_COUNT = 3;
// Regex that detects a link. Linked messages are instantly tracked.
const LINK_REGEX = new RegExp(/(http|https):\/\/.*/);
// Regex that detects a discord link. Discord links are tracked separately
const DISCORD_LINK_REGEX = new RegExp(/discord.gg\/.*/);

export function configSpamBlocker(client: Client) {
  client.on('messageCreate', (message) => {
    let isDiscordLink = DISCORD_LINK_REGEX.test(message.content);
    if (message.author.id == client.user?.id || message.member?.permissions.has(PermissionFlagsBits.Administrator))
      return;
    if (!LINK_REGEX.test(message.content) && !isDiscordLink && message.content.length < TRACKED_MESSAGE_MIN_LENGTH)
      return;
    let trackedUser = trackedUserCache[message.author.id];
    if (trackedUser === undefined) {
      trackedUserCache[message.author.id] = {
        messages: [],
      };
      trackedUser = trackedUserCache[message.author.id];
    }
    if (isDiscordLink) {
      // Track discord links
      if (!trackedUser.discord_links) {
        trackedUser.discord_links = {
          count: 0,
          time: Date.now(),
        };
      }
      trackedUser.discord_links.count += 1;
    } else {
      // Track long messages/messages with links
      let existingTrackedMessage = trackedUser.messages.find((x) => x.content == message.content);
      if (existingTrackedMessage) {
        existingTrackedMessage.count += 1;
      } else {
        if (trackedUser.messages.length == TRACKED_MESSAGE_MAX_COUNT) {
          // Kick out the oldest message
          let oldest_message_idx = 0;
          for (let i = 0; i < trackedUser.messages.length; i++) {
            if (trackedUser.messages[i].time < trackedUser.messages[oldest_message_idx].time) {
              oldest_message_idx = i;
            }
          }
          trackedUser.messages.splice(oldest_message_idx, 1);
        }
        // Add new message
        trackedUser.messages.push({
          content: message.content,
          count: 1,
          time: Date.now(),
        });
      }
    }
    cleanMessageCache();
    processAction(message, trackedUser);
  });
}

// Ban or warn client
function processAction(message: Message<boolean>, trackedUser: TrackedUser) {
  let highestMessagesSent = 0;
  for (let message of trackedUser.messages) {
    if (message.count > highestMessagesSent) highestMessagesSent = message.count;
  }
  if (trackedUser.discord_links && trackedUser.discord_links.count > highestMessagesSent) {
    highestMessagesSent = trackedUser.discord_links.count;
  }
  if (highestMessagesSent >= MESSAGE_SPAM_LIMIT) {
    message.member?.ban({
      deleteMessageSeconds: 86400, // Delete messages from past day
      reason: 'Spamming',
    });
    delete trackedUserCache[message.author.id];
  } else if (highestMessagesSent == MESSAGE_WARN_LIMIT) {
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
    trackedUser.messages = trackedUser.messages.filter((x) => now - x.time <= TRACKED_MESSAGE_DURATION);
    if (trackedUser.discord_links && now - trackedUser.discord_links.time > TRACKED_MESSAGE_DURATION) {
      trackedUser.discord_links = undefined;
    }
    if (trackedUser.messages.length == 0 && !trackedUser.discord_links) {
      toDeleteUserIds.push(userId);
    }
  }
  for (let userId of toDeleteUserIds) {
    delete trackedUserCache[userId];
  }
}
