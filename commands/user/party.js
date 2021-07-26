const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const Party = require('../../classes/party.js');

const subcommands = ['invite', 'i', 'inv', 'lock', 'l', 'unlock', 'ul', 'kick', 'appoint', 'disband', 'db', 'leave'];

module.exports = {
  name: 'party',
  aliases: ['p'],
  description: 'Party up with other users to fight in dungeons together.',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.data.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      if (subcommands.includes(args[0])) {
        let sc = args[0];
        let party = Party.parties.get(user.data.partyid);
        if (sc == 'invite' || sc == 'i' || sc == 'inv') {
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          let target_dp = message.guild.members.cache.get(target_id).user;
          userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE, target_id).then(function (target) {
            if (target == null) { Format.sendUserMessage(message, 'finderrorother'); return; }
            if (target.id == user.id) { Format.sendUserMessage(message, 'inviteself'); return; }
            if (party != undefined && !party.isLeader(user.id)) { Format.sendPartyMessage(message, 'leaderonly'); return; }
            let string = target_dp.tag + ", " + message.author.tag + " has invited you to their party. Accept?";
            Format.formatConfirmation(message, 'Party Invitation', string, Format.formatPartyJoin, [target_dp, message.author, user.data.partyid, user, target], target_id, "Accept");
          })
        } else if (sc == 'lock' || sc == 'l' || sc == 'unlock' || sc == 'ul') {
          if (party == undefined) { Format.sendUserMessage(message, 'notinparty'); return; }
          if (!party.isLeader(user.id)) { Format.sendPartyMessage(message, 'leaderonly'); return; }
          let locked = (sc == 'lock' || sc == 'l') ? true : false;
          if (party.locked != locked) { Format.sendPartyMessage(message, 'switchlock', [locked]); }
          party.locked = locked;
        } else if (sc == 'appoint') {
          if (party == undefined) { Format.sendUserMessage(message, 'notinparty'); return; }
          if (!party.isLeader(user.id)) { Format.sendPartyMessage(message, 'leaderonly'); return; }
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          if (!party.inParty(target_id)) { Format.sendPartyMessage(message, 'usernotinparty'); return; }
          party.leader_id = target_id;
          let target_dp = message.guild.members.cache.get(target_id).user;
          Format.sendPartyMessage(message, 'appointsuccess', [target_dp.tag]);
        } else if (sc == 'kick') {
          if (party == undefined) { Format.sendUserMessage(message, 'notinparty'); return; }
          if (!party.isLeader(user.id)) { Format.sendPartyMessage(message, 'leaderonly'); return; }
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          if (user.id == target_id) { Format.sendPartyMessage(message, 'kickleader'); return; }
          if (!party.inParty(target_id)) { Format.sendPartyMessage(message, 'usernotinparty'); return; }
          let kicked = party.remove(target_id);
          console.log(kicked)
          updateUTIL.updateUser(target_id, kicked.usergp.lastmsg, kicked.usergp.busy, -1, kicked.usergp.inventory,
            kicked.usergp.equipped, kicked.usergp.profile, kicked.usergp.profile.hp);
          let target_dp = message.guild.members.cache.get(target_id).user;
          Format.sendPartyMessage(message, 'kicksuccess', [target_dp.tag]);
          for (let key of Object.keys(party.members)) {
            let member = party.members[key];
            if (!party.isLeader(member.usergp.id)) Format.sendPartyMessage(message, 'hasleft', [target_dp.tag, member.userdp]);
          }
          if (Object.keys(party.members).length == 1) {
            party.remove(user.id);
            user.data.partyid = -1;
            updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory,
              user.equipped, user.profile, user.profile.hp);
            party.disband();
            Format.sendPartyMessage(message, 'disband_channel');
          }
        } else if (sc == 'disband' || sc == 'db') {
          if (party == undefined) { Format.sendUserMessage(message, 'notinparty'); return; }
          if (!party.isLeader(user.id)) { Format.sendPartyMessage(message, 'leaderonly'); return; }
          for (let key of Object.keys(party.members)) {
            let member = party.members[key];
            party.remove(member.usergp.id);
            member.usergp.data.partyid = -1;
            updateUTIL.updateUser(member.usergp.id, member.usergp.lastmsg, member.usergp.data, member.usergp.inventory,
              member.usergp.equipped, member.usergp.profile, member.usergp.profile.hp);
            if (!party.isLeader(member.usergp.id)) Format.sendPartyMessage(message, 'disband_dm', [member.userdp]);
          }
          party.disband();
          Format.sendPartyMessage(message, 'disband_success');
        } else if (sc == 'leave') {
          if (party == undefined) { Format.sendUserMessage(message, 'notinparty'); return; }
          if (Object.keys(party.members).length == 2) {
            for (let key of Object.keys(party.members)) {
              let member = party.members[key];
              if (!party.isLeader(member.usergp.id)) Format.sendPartyMessage(message, 'disband_dm', [member.userdp]);
              member.usergp.data.partyid = -1;
              updateUTIL.updateUser(member.usergp.id, member.usergp.lastmsg, member.usergp.data, member.usergp.inventory,
                member.usergp.equipped, member.usergp.profile, member.usergp.profile.hp);
            }
            party.disband();
          } else {
            if (party.isLeader(user.id)) {
              let leader = undefined;
              for (let key of Object.keys(party.members)) {
                let member = party.members[key];
                Format.sendPartyMessage(message, 'hasleft', [message.author.tag, member.userdp]);
                if (leader != undefined && member.usergp.id != user.id) {
                  leader = member;
                  party.leader_id = member.usergp.id;
                  party.remove(user.id);
                }
              }
              for (let key of Object.keys(party.members)) {
                let member = party.members[key];
                if (member.usergp.id == party.leader_id) Format.sendPartyMessage(message, 'selfleader', [member.userdp]);
                else Format.sendPartyMessage(message, 'newleader', [leader.tag, member.userdp]);
              }
            }
          }
        }
      } else {
        if (user.data.partyid == -1) { Format.sendUserMessage(message, 'notinparty'); return; }
        Format.formatParty(message, Party.parties.get(user.data.partyid));
      }
    })
  }
};