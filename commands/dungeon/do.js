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
  name: 'do',
  aliases: undefined,
  description: 'Do an action (ability)!',
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
        const floor = dungeon.activeFloors[party_index];
        const monster = floor.monsters[args[1] - 1];
        if (monster == null) { formatUTIL.sendDungeonMessage(message, 'invmonsternumber', channel); return; }
        if (monster.dead) { formatUTIL.sendDungeonMessage(message, 'deadmonster', channel); return; }
        let pprofile = dungeon.partyList[party_index][mem_index];
        if (pprofile.combat.done) { formatUTIL.sendDungeonMessage(message, 'turncomplete', channel); return; }
        // User does not have that ability
        if (pprofile.usergp.equipped.abilities.length < args[0] - 1) { formatUTIL.sendDungeonMessage(message, 'abilindexerror'); return; }
        let abil = pprofile.usergp.equipped.abilities[args[0] - 1];
        if (abil.target != 'all' && args.length < 2) { formatUTIL.sendDungeonMessage(message, 'targetnumber'); return; }
        if (pprofile.combat.ap < abil.apcost) { formatUTIL.sendDungeonMessage(message, 'insuffap'); return; }
        pprofile.combat.ap -= abil.apcost;
        const action = ('do ' + args[0] + (args.length > 1 ? " " + args[1] : "")).toLowerCase();
        pprofile.combat.actionqueue.push(action);
        dungeon.partyList[party_index][mem_index] = pprofile;
        formatUTIL.sendDungeonMessage(message, 'didability', [pprofile.combat.actionqueue, pprofile.combat.ap]);
      })
    })
  }
}