const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const Format = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
const Party = require('../../classes/party.js');

module.exports = {
  name: 'join',
  aliases: ['j'],
  description: 'Join an active dungeon!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (guild) {
      if (guild.activedungeon == null) {
        console.log("Error: Attempting to join non-present dungeon.");
        Format.sendDungeonMessage(message, 'joinerror');
      } else {
        userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
          if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
          if (user.data.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
          var dungeon = Dungeon.getDungeon(guild.activedungeon);
          // The dungeon has already expired 
          if (!dungeon.isJoinable()) { Format.sendDungeonMessage(message, 'expireerror'); return; }
          if (user.data.partyid == -1) {
            // The player is already in the dungeon
            if (dungeon.inParty(user.id)) { Format.sendDungeonMessage(message, 'inerror'); return; }
            // The maximum number of parties has already been reached 
            if (dungeon.getPartyCount() == guild.maxparties && dungeon.getRemainingSpots() == 0) {
              Format.sendDungeonMessage(message, 'maxparties', [message.author, guild.maxparties]);
              return;
            }
            var players = dungeon.attemptJoin(user.id, user, message.author);
            if (players != undefined) {
              var open = dungeon.partySize - players.members.length;
              for (let player of players.members) {
                if (player.usergp.id != user.id) {
                  Format.sendDungeonMessage(message, 'joinnotif', [user, player.userdp, open]);
                }
              }
            }
            Format.sendDungeonMessage(message, 'joinsuccess', [dungeon, user]);
          } else {
            let party = Party.parties.get(user.data.partyid);
            for (let id of Object.keys(party.members)) {
              if (dungeon.inParty(id)) { Format.sendDungeonMessage(message, 'someoneinerror'); return; }
            }
            if (party.locked && dungeon.getPartyCount() == guild.maxparties) { Format.sendDungeonMessage(message, 'maxparties'); return; }
            var players = dungeon.attemptJoin(undefined, undefined, undefined, party);
            if (players != undefined) {
              var open = dungeon.partySize - players.members.length - Object.keys(party.members).length;
              for (let player of players.members) {
                if (player.usergp.id != user.id) {
                  Format.sendDungeonMessage(message, 'partyjoinnotif', [party, player.userdp, open]);
                }
              }
            }
            Format.sendDungeonMessage(message, 'partyjoinsuccess', [dungeon, party]);
          }
        })
      }
    })
  }
}