const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const Item = require('../../classes/item.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').merchant;
const Random = require('../../classes/random.js');

module.exports = {
  name: 'buy',
  aliases: ['b', 'purchase'],
  description: "Buy the specified quantity of the specificed item.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      var quantity = 0;
      var index = 0;
      if (isNaN(args[0])) { quantity = 1; }
      else { quantity = parseInt(args[0]); index = 1; }
      var name = "";
      for (let i = index; i < args.length; i++) name += args[i] + " ";
      name = name.trim();
      var entry = undefined;
      for (let item of DB.items) if (item.name == name) { entry = item; break; }
      if (entry == undefined) { Format.sendMessage(message, gen_errors.no_such_item.format(Format.capitalizeFirsts(name)), syntax.buy); return; }
      if (entry.shopcost == '') { Format.sendMessage(message, Random.getRandomItem(messages.item_not_sold)); return; }
      Item.makeCategory(entry);
      const cost = parseInt(entry.shopcost) * quantity;
      if (user.profile.gold < cost) { Format.sendMessage(message, gen_errors.insuff_gold.format(cost)); return; }
      entry.quantity = quantity;
      user.profile.gold -= cost;
      Format.formatConfirmation(message, 'Purchase', messages.purchase_initiate.format(quantity, Format.capitalizeFirsts(name), cost, user.profile.gold), Format.formatPurchaseReply, [user, entry]);
    })
  }
};