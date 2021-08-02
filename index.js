require('dotenv').config();
const prefix = process.env.PREFIX;

const { Collection, Client, Intents } = require('discord.js');
const fs = require('fs');
const Dungeon = require('./classes/dungeon.js');
const exp = require('./utils/exp.js');
const update = require('./utils/update.js');
const server = require('./utils/server.js');
const Format = require('./utils/format.js');
const roleUTILS = require('./utils/roles.js');
const { waitForDebugger } = require('inspector');
const { ServerlessApplicationRepository } = require('aws-sdk');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
require('discord-buttons')(client);
client.commands = new Collection();

const COMMAND_DIR = './commands';

const initCommand = function (commandFiles, path) {
  for (const file of commandFiles) {
    let command = require(`${path}${file}`);
    if (command.interaction) client.api.applications(client.user.id).guilds('856965073850073119').commands.post({
      data: {
        name: command.name,
        description: command.description
      }
    });
    client.commands.set(command.name, command);
    if (command.aliases != undefined) {
      for (let alias of command.aliases) {
        client.commands.set(alias, command);
      }
    }
  }
}

const initCommands = async () => {
  const dirs = fs.readdirSync(COMMAND_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  for (let dir of dirs) {
    const file = COMMAND_DIR + '/' + dir;
    console.log("Initiating commands in dir " + file);
    initCommand(fs.readdirSync(file), file + '/');
  }
}

const parseCommand = function (message) {
  if (!message.content.startsWith(prefix)) { return; }
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;
  if (command == 'setchannel') args.push(client.channels);
  client.commands.get(command).execute(message, args);
}

client.once('ready', () => {
  initCommands();
});

client.on('guildCreate', async guild => {
  await server.eServerJoin(guild);
  server.serverData(undefined, guild.id).then(function (server) {
    roleUTILS.initRoles(guild, server);
  })
})

/** client.ws.on('INTERACTION_CREATE', async interaction => {
  try {
    client.commands.get(interaction.data.name).execute(interaction);
  } catch (error) {
    console.log("Caught error in interaction (index, 76)")
  }
}) */

client.on('message', message => {
  if (message.author.bot) return;
  // Try to spawn dungeon 
  server.serverData(message).then(function (guild) {
    if ((message.createdTimestamp - guild.lastdungeoncheck > Dungeon.DUNGEON_RATE ||
      guild.lastdungeoncheck == 0) && (message.createdTimestamp - guild.lastdungeon >
        Dungeon.DUNGEON_COOLDOWN || guild.lastdungeon == 0)) {
      console.log("Log: Attempting to spawn a dungeon");
      var dungeon = Dungeon.initDungeon(guild);
      if (dungeon != undefined) {
        dungeon.roles = guild.roles;
        Dungeon.addDungeon(dungeon);
        update.updateServer(guild.id, message.createdTimestamp, undefined, message.createdTimestamp,
          undefined, dungeon.id, undefined, undefined, undefined, undefined, guild).then(function () {
            Format.formatDungeonSpawn(dungeon, guild, message, guild.maxparties);
            parseCommand(message);
          })
      } else {
        update.updateServer(guild.id, undefined, undefined, message.createdTimestamp,
          undefined, undefined, undefined, undefined, undefined, undefined, guild).then(function () {
            parseCommand(message);
          });

      }
    } else { parseCommand(message); }
  });
});

client.login(process.env.TOKEN);