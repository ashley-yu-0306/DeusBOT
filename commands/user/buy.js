const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const Item = require('../../classes/item.js');

module.exports = {
  name: 'buy',
  aliases: ['b', 'purchase'],
  description: "Buy the specified quantity of the specificed item.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      var quantity = 0;
      var index = 0;
      if (isNaN(args[0])) { quantity = 1; }
      else { quantity = parseInt(args[0]); index = 1; }
      var name = "";
      for (let i = index; i < args.length; i++) {
        name += args[i] + " ";
      }
      name = name.trim();
      var entry = undefined;
      for (let item of DB.items) {
          if (item.name == name) { entry = item; break; }
      }
      if (entry == undefined) { Format.sendUserMessage(message, 'nosuchitem', [name]); return; }
      Item.makeCategory(entry);
      const cost = parseInt(entry.shopcost) * quantity;
      if (user.profile.gold < cost) { Format.sendUserMessage(message, 'notenoughgold', [quantity, name, cost]); return; }
      entry.quantity = quantity;
      user.profile.gold -= cost;
      const str = 'You are initiating a purchase for [' + quantity + "x] " + Format.capitalizeFirsts(name) + " for " + cost + " gold."
        + " Your remaining balance will be " + user.profile.gold + " gold. Proceed?";
      Format.formatConfirmation(message, 'Purchase', str, Format.formatPurchaseReply, [user, entry]);
    })
  }
};