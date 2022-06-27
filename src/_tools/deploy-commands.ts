import authConfig from '@config/auth.config.json';
import { REST } from '@discordjs/rest';
import { loadCommands } from '@src/classes/command';
import { Routes } from 'discord-api-types/v9';

async function main() {
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

main();
