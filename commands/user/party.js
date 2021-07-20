const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const Trading = require('../../classes/trading.js');
const Party = require('../../classes/party.js');

const subcommands = ['invite', 'i'];

module.exports = {
  name: 'party',
  aliases: ['p'],
  description: 'Party up with other users to fight in dungeons together.',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      if (subcommands.includes(args[0])) {
        if (args[0] == 'invite' || args[0] == 'i') {
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          let target_tag = message.guild.members.cache.get(target_id).user.tag;
          userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE, target_id).then(function (target) {
            if (target == null) { Format.sendUserMessage(message, 'finderrorother'); return; }
            let party = Party.parties.get(user.party_id);
            if (target.id == user.id) { Format.sendUserMessage(message, 'inviteself'); return; }
            if (party != undefined && !party.isLeader(user.id)) { Format.sendUserMessage(message, 'leaderonlyinvite'); return; }
            let string = target_tag + ", " + message.author.tag + " has invited you to their party. Accept?";
            Format.formatConfirmation(message, 'Party Invitation', string, Format.formatPartyJoin, [target_tag, message.author.tag, user.partyid, user, target], target_id, "Accept");
          })
        }

      } else {
        if (user.partyid == -1) { Format.sendUserMessage(message, 'notinparty'); return; }
        Format.formatParty(message, Party.parties.get(user.partyid));
      }
    })
  }
};