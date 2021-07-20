const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const formatUTIL = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
require('dotenv').config();
const prefix = process.env.PREFIX;

module.exports = {
  name: 'join',
  aliases: ['j'],
  description: 'Join an active dungeon!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (guild) {
      if (guild.activedungeon == null) {
        console.log("Error: Attempting to join non-present dungeon.");
        formatUTIL.sendDungeonMessage(message, 'joinerror');
      } else {
        userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
          if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
          if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
          var dungeon = Dungeon.getDungeon(guild.activedungeon);
          // The dungeon has already expired 
          if (!dungeon.isJoinable()) { formatUTIL.sendDungeonMessage(message, 'expireerror'); return; }
          // The player is already in the dungeon
          if (dungeon.inParty(user.id)) { formatUTIL.sendDungeonMessage(message, 'inerror'); return; }
          // The maximum number of parties has already been reached 
          if (dungeon.getPartyCount() == guild.maxparties && dungeon.getRemainingSpots() == 0) {
            formatUTIL.sendDungeonMessage(message, 'maxparties', [message.author, guild.maxparties]);
            return;
          }

          var players = dungeon.joinParty(user.id, user, message.author);
          if (players != undefined) {
            var open = dungeon.partySize - players.length;
            for (let player of players) {
              if (player.usergp.id != user.id) {
                formatUTIL.sendDungeonMessage(message, 'joinnotif', [user, player.userdp, open]);
              }
            }
          }
          formatUTIL.sendDungeonMessage(message, 'joinsuccess', [dungeon, user]);
          console.log("Success: User with id " + user.id + " has successfully joined an active dungeon in server " + guild.id);
        })
      }
    })
  }
}