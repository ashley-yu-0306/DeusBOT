const DB = require('../utils/db.js');
const roleUTILS = require('../utils/roles.js');

const serverJoin = function (server) {
  const guild = {
    id: server.id,
    lastdungeon: 0,
    lastraid: 0,
    lastdungeoncheck: 0,
    lastraidcheck: 0,
    activemembers: 0,
    activedungeon: 0,
    activeraid: 0,
    maxparties: 0,
    pchannels: [null, null, null, null, null, null],
    roles: [null, null, null, null, null, null]
  };
  DB.eUpdateEntry(DB.eTABLES.guild, guild);
  console.log("Success: Server with id " + server.id + " has been successfully added.");
  return guild;
}

exports.eServerJoin = serverJoin;

exports.serverData = async (message) => {
  var query = await DB.getEntryByID(message.guild.id, DB.eTABLES.guild);
  if (query.Items.length == 0) {
    console.log("Error: Server with id " + message.guild.id + " does not exist. Now adding server.");
    const server = serverJoin(message.guild);
    roleUTILS.initRoles(message.guild, server);
    query = await DB.getEntryByID(message.guild.id, DB.eTABLES.guild);
  }
  guild = {};
  query.Items.forEach(function (item) {
    guild.id = item.id;
    guild.lastdungeon = item.lastdungeon;
    guild.lastraid = item.lastraid;
    guild.lastdungeoncheck = item.lastdungeoncheck;
    guild.lastraidcheck = item.lastraidcheck;
    guild.activedungeon = item.activedungeon;
    guild.activeraid = item.activeraid;
    guild.maxparties = item.maxparties;
    guild.pchannels = item.pchannels;
    guild.roles = item.roles;
  });
  return guild;
}