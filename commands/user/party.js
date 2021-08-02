const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const Party = require('../../classes/party.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const messages = require('../../data/messages.js').party;
const subcommands = ['invite', 'i', 'inv', 'lock', 'l', 'unlock', 'ul', 'kick', 'appoint', 'disband', 'db', 'leave'];

module.exports = {
  name: 'party',
  aliases: ['p'],
  description: 'Party up with other users to fight in dungeons together.',
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      if (subcommands.includes(args[0])) {
        let sc = args[0];
        let party = Party.parties.get(user.data.partyid);
        if (party == undefined && (user.data.partyid != -1 || (sc != 'invite' &&
          sc != 'i' && sc != 'inv'))) {
          if (user.data.partyid != -1) {
            user.data.partyid = -1;
            updateUTIL.updateUser(user.id, user.lastmsg, user.data,
              user.inventory, user.equipped, user.profile, user.profile.hp);
            Format.sendMessage(message, gen_errors.enter_again);
          } else Format.sendMessage(message, messages.not_in_party);
          return;
        }
        if (sc == 'invite' || sc == 'i' || sc == 'inv') {
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          let target_dp = message.guild.members.cache.get(target_id).user;
          if (target_dp == undefined) { Format.sendMessage(message, gen_errors.no_such_user.format(args[1])); return; }
          userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE, target_id).then(function (target) {
            if (target == null) { Format.sendMessage(message, gen_errors.other_no_acc.format(target_dp.tag)); return; }
            if (target.id == user.id) { Format.sendMessage(message, gen_errors.target_self); return; }
            if (party != undefined && !party.isLeader(user.id)) { Format.sendMessage(message, messages.not_leader); return; }

            Format.formatConfirmation(message, 'Party Invitation', messages.invite_initiation.format(target_dp.tag, message.author.tag), Format.formatPartyJoin, [target_dp, message.author, user.data.partyid, user, target], target_id, "Accept");
          })
        } else if (sc == 'lock' || sc == 'l' || sc == 'unlock' || sc == 'ul') {
          if (party == undefined) { Format.sendMessage(message, messages.not_in_party); return; }
          if (!party.isLeader(user.id)) { Format.sendMessage(message, messages.not_leader); return; }
          let locked = (sc == 'lock' || sc == 'l') ? true : false;
          if (party.locked != locked) {
            if (locked) Format.sendMessage(message, messages.lock);
            else Format.sendMessage(message, messages.unlock);
          }
          party.locked = locked;
        } else if (sc == 'appoint') {
          if (party == undefined) { Format.sendMessage(message, messages.not_in_party); return; }
          if (!party.isLeader(user.id)) { Format.sendMessage(message, messages.not_leader); return; }
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          let target_dp = message.guild.members.cache.get(target_id).user;
          if (target_dp == undefined) { Format.sendMessage(message, gen_errors.no_such_user.format(args[1])); return; }
          if (!party.inParty(target_id)) { Format.sendMessage(message, messages.target_not_in_party.format(target_dp.tag)); return; }
          party.leader_id = target_id;
          Format.sendMessage(message, messages.appoint_success.format(user.tag, target_dp.tag));
        } else if (sc == 'kick') {
          if (party == undefined) { Format.sendMessage(message, messages.not_in_party); return; }
          if (!party.isLeader(user.id)) { Format.sendMessage(message, messages.not_leader); return; }
          if (args[1].length < 10) return;
          let target_id = args[1].slice(3);
          target_id = target_id.slice(0, target_id.length - 1);
          let target_dp = message.guild.members.cache.get(target_id).user;
          if (target_dp == undefined) { Format.sendMessage(message, gen_errors.no_such_user.format(args[1])); return; }
          if (user.id == target_id) { Format.sendMessage(message, messages.kick_leader); return; }
          if (!party.inParty(target_id)) { Format.sendMessage(message, messages.target_not_in_party.format(target_dp.tag)); return; }
          let kicked = party.remove(target_id);
          updateUTIL.updateUser(target_id, kicked.usergp.lastmsg, kicked.usergp.busy, -1, kicked.usergp.inventory,
            kicked.usergp.equipped, kicked.usergp.profile, kicked.usergp.profile.hp);
          Format.sendMessage(message, kick_success.format(target_dp.tag));
          for (let key of Object.keys(party.members)) {
            let member = party.members[key];
            if (!party.isLeader(member.usergp.id)) Format.sendMessage(message, messages.party_leave.format(target_dp.tag), '', member.userdp);
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
          if (party == undefined) { Format.sendMessage(message, messages.not_in_party); return; }
          if (!party.isLeader(user.id)) { Format.sendMessage(message, messages.not_leader); return; }
          for (let key of Object.keys(party.members)) {
            let member = party.members[key];
            party.remove(member.usergp.id);
            member.usergp.data.partyid = -1;
            updateUTIL.updateUser(member.usergp.id, member.usergp.lastmsg, member.usergp.data, member.usergp.inventory,
              member.usergp.equipped, member.usergp.profile, member.usergp.profile.hp);
            if (!party.isLeader(member.usergp.id)) Format.sendMessage(message, messages.party_disband_notif, '', member.userdp);
          }
          party.disband();
          Format.sendMessage(message, messages.party_disband);
        } else if (sc == 'leave') {
          if (party == undefined) { Format.sendMessage(message, messages.not_in_party); return; }
          if (Object.keys(party.members).length == 2) {
            for (let key of Object.keys(party.members)) {
              let member = party.members[key];
              if (!party.isLeader(member.usergp.id)) Format.sendMessage(message, messages.party_disband_notif, '', member.userdp);
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
                Format.sendMessage(message, messages.party_leave.format(message.author.tag), '', member.userdp);
                if (leader != undefined && member.usergp.id != user.id) {
                  leader = member;
                  party.leader_id = member.usergp.id;
                  party.remove(user.id);
                }
              }
              for (let key of Object.keys(party.members)) {
                let member = party.members[key];
                if (member.usergp.id == party.leader_id) Format.sendMessage(message, messages.reassign_self_success, '', member.userdp);
                else Format.sendMessage(message, messages.reassign_other_success.format(leader.tag), '', member.userdp);
              }
            }
          }
        }
      } else {
        if (user.data.partyid == -1) { Format.sendMessage(message, messages.not_in_party); return; }
        Format.formatParty(message, Party.parties.get(user.data.partyid));
      }
    })
  }
};