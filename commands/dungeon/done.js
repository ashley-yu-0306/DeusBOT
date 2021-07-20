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
  name: 'done',
  aliases: undefined,
  description: 'Finish turn in dungeon!',
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
        var pprofile = dungeon.partyList[party_index][mem_index];
        if (pprofile.combat.done) { formatUTIL.sendDungeonMessage(message, 'turncomplete', channel); return; }
        pprofile.combat.done = true;
        var notdone = [];
        for (let user of dungeon.partyList[party_index]) {
          if (!user.combat.done) notdone.push(user.tag);
        }
        formatUTIL.sendDungeonMessage(message, 'diddone', [dungeon.partyList[party_index][mem_index].combat.actionqueue, notdone]);
        if (notdone.length > 0) return;
        CombatController.resolveCombat(party_index, dungeon.activeFloors[party_index], message.channel, dungeon.partyList[party_index]);
      })
    })
  }
}