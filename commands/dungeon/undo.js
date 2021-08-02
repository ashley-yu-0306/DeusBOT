const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const formatUTIL = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').dungeon;
const Assertion = require('../../utils/assertion.js');

module.exports = {
  name: 'undo',
  aliases: undefined,
  description: 'Undo an action!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (server) {
      if (!Assertion.assertDungeonCommand(message, undefined, server)) return;
      userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
        if (args.length == 0) {
          formatUTIL.sendMessage(message, gen_errors.missing_args, syntax.undo);
          return;
        }
        if (!Assertion.assertDungeonCommand(message, user, server)) return;
        let dungeon = Dungeon.getDungeon(server.activedungeon);
        const mem_index = dungeon.getPartyMemberIndex(user.id);
        let profile = dungeon.partyList[dungeon.getPartyNumber(user.id) - 1].members[mem_index];
        if (profile.combat.actionqueue.length == 0) {
          formatUTIL.sendMessage(message, messages.action_queue_empty); return;
        }
        if (args.length == 0) {
          formatUTIL.sendMessage(message, gen_errors.missing_args, syntax.undo);
          return;
        }
        let action = args.join(" ");
        let index = profile.combat.actionqueue.indexOf(action);
        if (index == -1) {
          formatUTIL.sendMessage(message, messages.no_such_action.format(action), syntax.undo);
          return;
        }
        profile.combat.actionqueue.splice(index, 1);
        if (args[0].toLowerCase() == 'use') {
          let item = profile.usergp.equipped.consumables[args[1] - 1];
          profile.combat.ap = profile.combat.ap + parseInt(item.apcost);
          let used = profile.combat.used[item.name];
          profile.combat.used[item.name] = used - 1;
          let remaining = item.quantity - used + 1;
          formatUTIL.sendMessage(message, messages.undo_use_success.format(action, remaining, item.name, profile.combat.ap));
        } else if (args[0].toLowerCase() == 'do') {
          let ability = user.equipped.abilities[parseInt(args[1])];
          profile.combat.ap = profile.combat.ap + parseInt(ability.apcost);
          formatUTIL.sendMessage(message, messages.undo_use_success.format(action, profile.combat.ap));
        }
      })
    })
  }
}