const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const formatUTIL = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
const CombatController = require('../../classes/combatController.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const messages = require('../../data/messages.js').dungeon;
const Assertion = require('../../utils/assertion.js');

module.exports = {
  name: 'done',
  aliases: undefined,
  description: 'Finish turn in dungeon!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (server) {
      if (!Assertion.assertDungeonCommand(message, undefined, server)) return;
      userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
        if (!Assertion.assertDungeonCommand(message, user, server)) return;
        var dungeon = Dungeon.getDungeon(server.activedungeon);
        const party_index = dungeon.getPartyNumber(user.id) - 1;
        const mem_index = dungeon.getPartyMemberIndex(user.id);
        var profile = dungeon.partyList[party_index].members[mem_index];
        if (profile.combat.done) { formatUTIL.sendMessage(message, messages.already_done); return; }
        profile.combat.done = true;
        var notdone = "";
        for (let i = 0; i < dungeon.partyList[party_index].members.length; i++) {
          let user = dungeon.partyList[party_index].members[i];
          if (!user.combat.done) notdone += user.tag;
          if (i != dungeon.partyList[party_index].members.length - 1) notdone += ", "
        }
        if (notdone.length > 0) {
          formatUTIL.sendMessage(message, messages.turn_confirmed_notdone.format(notdone));
          return;
        }
        formatUTIL.sendMessage(message, messages.turn_confirmed_done);
        CombatController.resolveCombat(party_index, dungeon.activeFloors[party_index], message.channel, dungeon.partyList[party_index]);
      })
    })
  }
}