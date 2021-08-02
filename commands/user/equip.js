const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const { classCanEquip } = require('../../classes/equipment.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const messages = require('../../data/messages.js').equip;
const syntax = require('../../data/messages.js').syntax;

module.exports = {
  name: 'equip',
  aliases: ['e'],
  description: "Equip the given item.",
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      if (args.length < 2) { Format.sendMessage(message, gen_errors.missing_args, syntax.equip); return; }
      if (!DB.sets.includes(args[0])) { Format.sendMessage(message, messages.no_such_set.format(args[0]), syntax.equip); return; }
      var input = "";
      for (let arg of args) input += arg + " ";
      input = input.trim();
      if (input.includes('coffer')) { Format.sendMessage(message, messages.equip_coffer); return; }
      const keys = Object.keys(user.inventory);
      var name = undefined;
      for (let key of keys) {
        if (key.includes(input) && classCanEquip(key, user)) { name = key; break; }
      }
      if (name == undefined) { Format.sendMessage(message, messages.wrong_class.format(input)); return; }
      var item = user.inventory[name];
      if (item.levelreq > user.profile.level) { Format.sendMessage(message, gen_errors.req_level.format(item.levelreq)); return; }
      var equipped = user.equipped.armor[item.slot];
      userUTIL.updateEquipped(user.inventory, user.equipped.armor, user.profile, item.slot, item);
      if (equipped == null) Format.sendMessage(message, messages.equip_success.format(Format.capitalizeFirsts(item.name), Format.capitalizeFirsts(item.slot)));
      else Format.sendMessage(message, messages.replace_success.format(item.name, item.slot, equipped.name));
      updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};