import { REST } from '@discordjs/rest';
import { loadCommands } from '@src/misc/command';
import { AuthConfig } from '@src/misc/config';
import { Routes } from 'discord-api-types/v9';

async function main(debug: boolean = false) {
  const authConfig: AuthConfig = debug
    ? require('@src/config/auth.debug.config.json')
    : require('@src/config/auth.config.json');

  const commands = await loadCommands();

  console.log('🔍 Found commands:');
  for (const command of commands) {
    console.log(`\t- ${command.data.name}`);
  }

  const rest = new REST({ version: '9' }).setToken(authConfig.bot.token);

  rest
    .put(Routes.applicationGuildCommands(authConfig.bot.clientId, authConfig.bot.guildId), {
      body: commands.map((x) => x.data.toJSON()),
    })
    .then(() => console.log('🚀 Successfully registered application commands.'))
    .catch(console.error);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0]) {
    case 'development':
      main(true);
      break;
    case 'production':
    default:
      main(false);
      break;
  }
} else {
  switch (process.env.NODE_ENV) {
    case 'development':
      main(true);
      break;
    case 'production':
    default:
      main(false);
      break;
  }
}
