import { ActivityType, Client } from 'discord.js';
import random from 'random';

export const ActivityStatuses = [
  'Stuck in Unity',
  'Why is my game not running',
  'Generating assets',
  'Finding secrets',
  'Coding Actually Good FPS',
  'Browsing stackoverflow',
  'Trying to use Unreal',
  'Developing the next hottest game',
  'Turning off and on',
  'No bugs, only features',
  'Waiting for code to compile',
  'Blendering a masterpiece',
];

const StatusCycleInterval = 60_000 * 5;

function randomizeStatus(client: Client) {
  client.user?.setActivity({
    name: ActivityStatuses[random.int(0, ActivityStatuses.length - 1)],
    type: ActivityType.Playing,
  });
}

export function configureActivityStatus(client: Client) {
  randomizeStatus(client);
  setInterval(() => {
    randomizeStatus(client);
  }, StatusCycleInterval);
}
