const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const CONTENTS = ['equipment', 'weapons', 'armor', 'consumables', 'items']
const Item = require('../../classes/item.js');
const { classCanEquip } = require('../../classes/equipment.js');

module.exports = {
  name: 'equip',
  aliases: ['e'],
  description: "Equip the given item.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      if (args.length < 2) { Format.sendUserMessage(message, 'NEargs'); return; }
      if (!DB.sets.includes(args[0])) { Format.sendUserMessage(message, 'nosuchset'); return; }
      var input = "";
      for (let arg of args) input += arg + " ";
      if (input.includes('coffer')) { Format.sendUserMessage(message, 'equipcoffer'); return; }
      const keys = Object.keys(user.inventory);
      var name = undefined;
      for (let key of keys) {
        if (key.includes(input) && classCanEquip(key, user)) { name = key; break; }
      }
      if (name == undefined) { Format.sendUserMessage(message, 'nonequippable'); return; }
      var item = user.inventory[name];
      if (item.levelreq > user.profile.level) { Format.sendUserMessage(message, 'insufflevel'); return; }
      var equipped = user.equipped.armor[item.slot];
      userUTIL.updateEquipped(user.inventory, user.equipped.armor, user.profile, item.slot, item);
      Format.sendUserMessage(message, 'equipsuccess', [item, equipped]);
      updateUTIL.updateUser(user.id, user.lastmsg, user.partyid, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};