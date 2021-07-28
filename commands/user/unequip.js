const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const Equipment = require('../../classes/equipment.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').equip;

module.exports = {
  name: 'unequip',
  aliases: ['ue'],
  description: "Unequip the given item.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      if (args.length == 0) { Format.sendMessage(message, gen_errors.missing_args, syntax.unequip); return; }
      const name = args[0].toLowerCase();
      if (!Equipment.PIECE_SLOT.includes(name)) {
        Format.sendMessage(message, messages.invalid_slot.format(name)); return;
      }
      var item = user.equipped.armor[name];
      if (item == null) { Format.sendUserMessage(message, messages.none_equipped.format(name), syntax.unequip); return; }

      userUTIL.updateEquipped(user.inventory, user.equipped.armor, user.profile, item.slot);
      Format.sendMessage(message, messages.unequip_success.format(Format.capitalizeFirsts(item.name), Format.capitalizeFirsts(item.slot)));
      updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};

