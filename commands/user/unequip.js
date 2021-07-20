const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const CONTENTS = ['equipment', 'weapons', 'armor', 'consumables', 'items']
const Item = require('../../classes/item.js');
const { classCanEquip } = require('../../classes/equipment.js');
const Equipment = require('../../classes/equipment.js');

module.exports = {
  name: 'unequip',
  aliases: ['ue'],
  description: "Unequip the given item.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      const name = args[0].toLowerCase();
      if (!Equipment.PIECE_SLOT.includes(name)) {
        Format.sendUserMessage(message, 'invalidslot'); return;
      }
      var item = user.equipped.armor[name];
      if (item == null) { Format.sendUserMessage(message, 'nonequipped'); return; }

      userUTIL.updateEquipped(user.inventory, user.equipped.armor, user.profile, item.slot);
      Format.sendUserMessage(message, 'unequipsuccess', [item, item.slot]);
      updateUTIL.updateUser(user.id, user.lastmsg, user.busy, user.partyid, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};

