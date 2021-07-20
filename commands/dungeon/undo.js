const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const userUTIL = require('../../utils/user.js');
const serverUTIL = require('../../utils/server.js');
const formatUTIL = require('../../utils/format.js');
const Dungeon = require('../../classes/dungeon.js');
require('dotenv').config();
const prefix = process.env.PREFIX;
const CombatController = require('../../classes/combatController.js');

module.exports = {
  name: 'undo',
  aliases: undefined,
  description: 'Undo an action!',
  execute(message, args) {
    serverUTIL.serverData(message).then(function (server) {
      if (server.activedungeon == null) { formatUTIL.sendDungeonMessage(message, 'doneerror'); return; }
      userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
        if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
        var dungeon = Dungeon.getDungeon(server.activedungeon);
        // User is not in any party
        const party_index = dungeon.getPartyNumber(user.id) - 1;
        if (party_index == -1) { formatUTIL.sendDungeonMessage(message, 'nopartyerror'); return; }
        // Message not in dungeon channel
        const channel = server.pchannels[party_index];
        if (channel != message.channel.id) { formatUTIL.sendDungeonMessage(message, 'channelerror', channel); return; }
        const mem_index = dungeon.getPartyMemberIndex(user.id);
        let pprofile = dungeon.partyList[party_index][mem_index];
        if (pprofile.combat.actionqueue.length == 0) { formatUTIL.sendDungeonMessage(message, 'emptyactionqueue'); return; }
        var action = "";
        for (let arg of args) action += arg + " ";
        action = action.trim();
        var index = pprofile.combat.actionqueue.indexOf(action);
        if (index == -1) { formatUTIL.sendDungeonMessage(message, 'nosuchaction', [pprofile.combat.actionqueue]); return; }
        pprofile.combat.actionqueue.splice(index, 1);
        var item = pprofile.usergp.equipped.consumables[args[1] - 1];
        pprofile.combat.ap = pprofile.combat.ap + parseInt(item.apcost);
        var used = pprofile.combat.used.get(item.name);
        pprofile.combat.used.set(item.name, used - 1);
        var remaining = item.quantity - used + 1;
        dungeon.partyList[party_index][mem_index] = pprofile;
        formatUTIL.sendDungeonMessage(message, 'undosuccess', [action, pprofile.combat.actionqueue, pprofile.combat.ap, item.name, remaining]);
      })
    })
  }
}