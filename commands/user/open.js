const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const CONTENTS = ['equipment', 'weapons', 'armor', 'consumables', 'items']
const Item = require('../../classes/item.js');
const Equipment = require('../../classes/equipment.js');
const Random = require('../../classes/random.js');
const Loot = require('../../data/loot.js');

module.exports = {
  name: 'open',
  aliases: undefined,
  description: "Open the given coffer.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      if (!DB.sets.includes(args[0])) { Format.sendUserMessage(message, 'nosuchset'); return; }
      var item = user.inventory[args[0] + " gear coffer"];
      if (item == undefined) { Format.sendUserMessage(message, 'nosuchcoffer'); return; }

      const n = Random.getRandomInt(0, 10);
      var equipment = Equipment.randomEquipFromSet("dungeon", item.dungeonid, n == 5 ? 2 : 1)[0];
      var loot_summary = message.author.tag + " obtained [" + equipment.quantity + "x " + Format.capitalizeFirsts(equipment.name) + "]";
      const loot_table = Loot.dungeon_loot[item.dungeonid - 1];
      var k = Random.getRandomInt(0, loot_table.length);
      var loot_info = loot_table[k];
      var loot = Item.makeItem(loot_info[0], Random.getRandomInt(loot_info[1], loot_info[2] + 1));
      loot_summary += " and [" + loot.quantity + "x " + Format.capitalizeFirsts(loot.name) + "].";

      userUTIL.updateItem(equipment, user.inventory);
      userUTIL.updateItem(loot, user.inventory);
      Format.sendUserMessage(message, 'lootgained', [loot_summary]);
      updateUTIL.updateUser(user.id, user.lastmsg, user.busy, user.partyid, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};