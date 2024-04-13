import { Client, Message, PermissionFlagsBits, Snowflake } from 'discord.js';
import { defaultEmbed } from './utils';

// A message a user sent
interface TrackedMessage {
  content: string; // Latest message sent by user
  time: number; // Time message was created
  count: number; // Number of times message was sent
}

// Stores the last message the user sent in different channels
interface TrackedUser {
  // Tracked messages
  messages: TrackedMessage[];
}

let userMessageCache: {
  [userId: Snowflake]: TrackedUser;
} = {};

// Oldest message to track, in milliseconds.
const TRACKED_MESSAGE_DURATION = 1000 * 60 * 10; // 10 minutes
// Number of times the same message can be sent in before the user gets banned.
const MESSAGE_SPAM_LIMIT = 5;
// Number of times the same message can be sent in before the user gets warned.
const MESSAGE_WARN_LIMIT = 3;
// Minimum size of messages that will be processed by the spam blocker.
const TRACKED_MESSAGE_MIN_LENGTH = 24;
// Maximum number of messages to track from a user.
const TRACKED_MESSAGE_MAX_COUNT = 3;
// Regex that detects a link. Linked messages are instantly tracked.
const LINK_REGEX = new RegExp(/((http|https):\/\/.*|discord.gg\/.*)/);

export function configSpamBlocker(client: Client) {
  client.on('messageCreate', (message) => {
    if (
      !LINK_REGEX.test(message.content) &&
      (message.author.id == client.user?.id ||
        message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
        message.content.length < TRACKED_MESSAGE_MIN_LENGTH)
    ) {
      return;
    }
    if (!userMessageCache[message.author.id]) {
      userMessageCache[message.author.id] = {
        messages: [],
      };
    }
    let trackedUser = userMessageCache[message.author.id];
    if (trackedUser === undefined) {
      userMessageCache[message.author.id] = {
        messages: [],
      };
      trackedUser = userMessageCache[message.author.id];
    }
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
  if (highestMessagesSent >= MESSAGE_SPAM_LIMIT) {
    message.member?.ban({
      deleteMessageSeconds: 86400, // Delete messages from past day
      reason: 'Spamming',
    });
  } else if (highestMessagesSent == MESSAGE_WARN_LIMIT) {
    message.reply({
      embeds: [
        defaultEmbed()
          .setTitle('⚠️ Stop Sending Messages')
          .setDescription(
            `Attention <@${message.author.id}>, you are sending too many messages! If you send any more you may be banned.`,
          ),
      ],
    });
  }
}

// Removes old messages from message cache
function cleanMessageCache() {
  let now = Date.now();
  let toDeleteUserIds = [];
  for (let userId in userMessageCache) {
    let trackedUser = userMessageCache[userId];
    trackedUser.messages = trackedUser.messages.filter((x) => now - x.time <= TRACKED_MESSAGE_DURATION);
    if (trackedUser.messages.length == 0) {
      toDeleteUserIds.push(userId);
    }
  }
  for (let userId of toDeleteUserIds) {
    delete userMessageCache[userId];
  }
}
