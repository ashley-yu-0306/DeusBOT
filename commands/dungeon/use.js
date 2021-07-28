const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const formatUTIL = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').dungeon;
const Assertion = require('../../utils/assertion.js');

module.exports = {
  name: 'use',
  aliases: undefined,
  description: 'Use an item!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (server) {
      if (!Assertion.assertDungeonCommand(message, undefined, server)) return;
      userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
        if (args.length < 2) {
          formatUTIL.sendMessage(message, gen_errors.missing_args, syntax.use);
          return;
        }
        if (!Assertion.assertDungeonCommand(message, user, server, true)) return;
        var dungeon = Dungeon.getDungeon(server.activedungeon);
        const mem_index = dungeon.getPartyMemberIndex(user.id);
        let profile = dungeon.partyList[dungeon.getPartyNumber(user.id) - 1].members[mem_index];
        if (profile.usergp.equipped.consumables.length == 0 ||
          profile.usergp.equipped.consumables.length < args[0] - 1) {
          formatUTIL.sendMessage(message, messages.no_such_item.format(args[0]));
          return;
        }
        let item = profile.usergp.equipped.consumables[args[0] - 1];
        let used = profile.combat.used[item.name];
        if (used != undefined) {
          if (used == item.quantity) {
            formatUTIL.sendMessage(message, messages.insuff_items); return;
          }
          else { profile.combat.used[item.name] = used++; }
        }
        else { used = 0; profile.used[item.name] = 1; }
        if (profile.combat.ap < item.apcost) {
          formatUTIL.sendMessage(message, messages.insuff_AP); return;
        }
        profile.combat.ap -= item.apcost;
        const action = ('use ' + args[0]).toLowerCase();
        profile.combat.actionqueue.push(action);
        formatUTIL.sendMessage(message, messages.action_added.format(profile.combat.ap));
      })
    })
  }
}