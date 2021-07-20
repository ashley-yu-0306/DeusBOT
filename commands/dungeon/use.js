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
  name: 'use',
  aliases: undefined,
  description: 'Use an item!',
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
        if (pprofile.combat.done) { formatUTIL.sendDungeonMessage(message, 'turncomplete', channel); return; }
        if (pprofile.usergp.equipped.consumables.length < args[0] - 1) { formatUTIL.sendDungeonMessage(message, 'itemindexerror'); return; }
        let item = pprofile.usergp.equipped.consumables[args[0] - 1];
        let used = pprofile.combat.used.get(item.name);
        if (used != undefined) {
          if (used == item.quantity) { formatUTIL.sendDungeonMessage(message, 'insuffitem'); return; }
          else { pprofile.combat.used.set(item.name, used++); }
        }
        else { used = 0; pprofile.used.set(item.name, 1); }
        if (pprofile.combat.ap < item.apcost) { formatUTIL.sendDungeonMessage(message, 'insuffap'); return; }
        pprofile.combat.ap -= item.apcost;
        const action = ('use ' + args[0]).toLowerCase();
        pprofile.combat.actionqueue.push(action);
        dungeon.partyList[party_index][mem_index] = pprofile;
        formatUTIL.sendDungeonMessage(message, 'didaction', [pprofile.combat.actionqueue, pprofile.combat.ap, item.quantity - used - 1, item.name]);
      })
    })
  }
}