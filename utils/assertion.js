const Format = require('./format.js');
const messages = require('../data/messages.js');
const Dungeon = require('../classes/dungeon.js');

class Assertion {
  /**
   * Returns whether the given user exists. 
   * 
   * @param {*} user  The user in question
   * @returns         Whether [user] exists
   */
  static assertExists(user) {
    if (user == null) { Format.sendMessage(message, messages.gen_errors.self_no_acc); return false; }
    return true;
  }

  /**
   * Returns whether [user] is able to execute a dungeon command.
   * 
   * @param {*} user    The user in question
   * @param {*} server  The server that [user] is executing this command in 
   * @param {*} costAP  Whether [user] is attempting to execute a command that 
   *                    costs AP
   * @param {*} isJoin  Whether [user] is attempting to join a dungeon
   * @returns           Whether [user] is able to execute the dungeon command
   */
  static assertDungeonCommand(message, user, server, costAP = false, isJoin = false) {
    if (server.activedungeon == null) { Format.sendMessage(message, messages.dungeon.inactive_dungeon); return false; }
    if (user == undefined) return true;
    let dungeon = Dungeon.getDungeon(server.activedungeon);
    let party_index = dungeon.getPartyNumber(user.id) - 1;
    if (isJoin) {
      if (party_index != -1) { Format.sendMessage(message, messages.dungeon.in_party); return false; }
      if (user.data.partyid == -1) {
      } else {
        let party = Party.parties.get(user.data.partyid);
        if (party == undefined) return true;
        for (let id of Object.keys(party)) {
          if (dungeon.inParty(id)) {
            Format.sendMessage(message, messages.dungeon.other_in_party.format(party.members[id].tag));
            return false;
          }
        }
      }
    } else {
      if (party_index == -1) {
        Format.sendMessage(message, messages.dungeon.not_in_party);
        return false;
      }
      if (server.pchannels[party_index] != message.channel.id) {
        Format.sendMessage(message, messages.dungeon.not_dungeon_channel);
        return false;
      }
      if (costAP) {
        let profile = dungeon.partyList[party_index].members[dungeon.getPartyMemberIndex(user.id)];
        if (profile.combat.done) {
          Format.sendMessage(message, messages.dungeon.already_done);
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = Assertion;