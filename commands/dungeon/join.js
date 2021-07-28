const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const Format = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
const Party = require('../../classes/party.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').dungeon;

module.exports = {
  name: 'join',
  aliases: ['j'],
  description: 'Join an active dungeon!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (server) {
      if (server.activedungeon == null) { formatUTIL.sendMessage(message, messages.inactive_dungeon); return; }
      else {
        userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
          if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
          if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
          var dungeon = Dungeon.getDungeon(guild.activedungeon);
          // The dungeon has already expired 
          if (!dungeon.isJoinable()) { Format.sendMessage(message, messages.expired); return; }
          if (user.data.partyid == -1) {
            // The player is already in the dungeon
            if (dungeon.inParty(user.id)) { Format.sendMessage(message, messages.in_party); return; }
            // The maximum number of parties has already been reached 
            if (dungeon.getPartyCount() == guild.maxparties && dungeon.getRemainingSpots() == 0) {
              Format.sendMessage(message, messages.no_slots);
              return;
            }
            var players = dungeon.attemptJoin(user.id, user, message.author);
            if (players == -1) { Format.sendMessage(message, messages.no_slots); return; }
            if (players != undefined) {
              var open = dungeon.members.length - players.members.length;
              if (open == undefined) open = 0;
              for (let player of players.members) {
                if (player.usergp.id != user.id) {
                  Format.sendMessage(message, messages.join_notif.format(message.author.tag, user.profile.level, open, dungeon.timer), '', player.userdp);
                }
              }
            }
            Format.sendMessage(message, messages.join_success.format(dungeon.getPartyNumber(user.id), dungeon.getPartyMemberCount(user.id) - 1, dungeon.timer), '', message.author);
          } else {
            let party = Party.parties.get(user.data.partyid);
            let party_keys = Object.keys(party.members);
            for (let id of party_keys) {
              if (dungeon.inParty(id)) { Format.sendMessage(message, messages.other_in_party.format(party.members[id].tag)); return; }
            }
            if (party.locked && dungeon.getPartyCount() == guild.maxparties) { Format.sendMessage(message, messages.no_slots); return; }
            var players = dungeon.attemptJoin(undefined, undefined, undefined, party);
            if (players == -1) { Format.sendMessage(message, messages.no_slots); return; }
            if (players != undefined) {
              var open = dungeon.members.length - players.members.length - party_keys.length;
              if (open == undefined) open = 0;
              for (let player of players.members) {
                if (!party_keys.includes(player.usergp.id)) {
                  Format.sendMessage(message, messages.party_join_notif.format(party_keys.length, open, dungeon.timer), '', player.userdp);
                }
              }
            }
            for (let id of party_keys) {
              let member = party.members[id];
              if (party.locked) Format.sendMessage(message, messages.l_party_join_success.format(dungeon.getPartyNumber(user.id), dungeon.timer), '', member.userdp);
              else Format.sendMessage(message, messages.l_party_join_success.format(dungeon.getPartyNumber(user.id), dungeon.getPartyMemberCount(user.id) - party_keys.length, dungeon.timer), '', member.userdp);
            }
          }
        })
      }
    })
  }
}