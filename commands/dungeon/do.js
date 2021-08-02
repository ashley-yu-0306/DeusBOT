const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const formatUTIL = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').dungeon;
const Assertion = require('../../utils/assertion.js');

module.exports = {
  name: 'do',
  aliases: undefined,
  description: 'Do an action (ability)!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (server) {
      if (!Assertion.assertDungeonCommand(message, undefined, server)) return;
      userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
        if (args.length < 2) {
          formatUTIL.sendMessage(message, gen_errors.missing_args, syntax.do);
          return;
        }
        if (!Assertion.assertDungeonCommand(message, user, server, true)) return;
        let dungeon = Dungeon.getDungeon(server.activedungeon);
        let profile = dungeon.partyList[dungeon.getPartyNumber(user.id) - 1].members[mem_index];
        if (profile.usergp.equipped.abilities.length < args[0] - 1) {
          formatUTIL.sendMessage(message, messages.no_such_ability.format(args[0]));
          return;
        }
        let abil = profile.usergp.equipped.abilities[args[0] - 1];
        if (abil.target != 'all' && args.length < 2) {
          formatUTIL.sendMessage(message, messages.no_target); return;
        }
        if (profile.combat.ap < abil.apcost) {
          formatUTIL.sendMessage(message, messages.insuff_AP); return;
        }
        const mem_index = dungeon.getPartyMemberIndex(user.id);
        const monster = dungeon.activeFloors[party_index].monsters[args[1] - 1];
        if (monster == null) {
          formatUTIL.sendMessage(message, messages.no_such_monster); return;
        }
        if (monster.dead) {
          formatUTIL.sendMessage(message, messages.dead_monster); return;
        }
        profile.combat.ap -= abil.apcost;
        const action = ('do ' + args[0] + (args.length > 1 ? " " + args[1] : "")).toLowerCase();
        profile.combat.actionqueue.push(action);
        formatUTIL.sendMessage(message, messages.action_added.format(pprofile.combat.ap));
      })
    })
  }
}