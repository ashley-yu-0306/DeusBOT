const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const Item = require('../../classes/item.js');
const Equipment = require('../../classes/equipment.js');
const Random = require('../../classes/random.js');
const Loot = require('../../data/loot.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const messages = require('../../data/messages.js').open;
const syntax = require('../../data/messages.js').syntax;

module.exports = {
  name: 'open',
  aliases: undefined,
  description: "Open the given coffer.",
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      if (args.length == 0) { Format.sendMessage(message, gen_errors.missing_args, syntax.open); return; }
      if (!DB.sets.includes(args[0])) { Format.sendMessage(message, messages.no_such_set.format(args[0]), syntax.open); return; }
      var item = user.inventory[args[0] + " gear coffer"];
      if (item == undefined) { Format.sendMessage(message, messages.missing_coffer.format(Format.capitalizeFirsts(args[0] + " gear coffer"))); return; }

      const n = Random.getRandomInt(0, 10);
      var equipment = Equipment.randomEquipFromSet("dungeon", item.dungeonid, n == 5 ? 2 : 1)[0];
      const loot_table = Loot.dungeon_loot[item.dungeonid];
      var k = Random.getRandomInt(0, loot_table.length);
      var loot_info = loot_table[k];
      var loot = Item.makeItem(loot_info[0], Random.getRandomInt(loot_info[1], loot_info[2] + 1));
      Format.sendMessage(message, messages.obtained.format(message.author.tag, equipment.quantity, Format.capitalizeFirsts(equipment.name),
        loot.quantity, Format.capitalizeFirsts(loot.name)));
      userUTIL.updateItem(equipment, user.inventory);
      userUTIL.updateItem(loot, user.inventory);
      updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};