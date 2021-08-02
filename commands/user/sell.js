const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const messages = require('../../data/messages.js').merchant;
const Random = require('../../classes/random.js');

module.exports = {
  name: 'sell',
  aliases: ['s', 'sell'],
  description: "Sell the specified quantity of the specificed item.",
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      if (args.length == 0) { Format.sendMessage(message, gen_errors.missing_args, syntax.open); return; }
      var quantity = 0;
      var index = 0;
      if (isNaN(args[0])) {
        if (args[0] == 'all') { quantity = -1; index = 1; }
        else quantity = 1;
      }
      else { quantity = parseInt(args[0]); index = 1; }
      var name = "";
      for (let i = index; i < args.length; i++) name += args[i] + " ";
      name = name.trim();
      if (quantity == -1 && name == 'items') {
        let empty = true, gold = 0;
        for (let key of Object.keys(user.inventory)) {
          empty = false;
          var item = user.inventory[key];
          if (item.category.includes('items')) {
            gold += item.quantity * parseInt(item.sellcost);
            delete user.inventory[key];
          }
        }
        if (empty) { Format.sendMessage(message, messages.no_items, syntax.sell); return; }
        user.profile.gold += gold;
        Format.formatConfirmation(message, 'Sale', messages.sell_all_initiate.format(gold), Format.formatSellReply, [user]);
      } else {
        var entry = undefined;
        for (let item of DB.items) if (item.name == name) { entry = item; break; }
        if (entry == undefined) { Format.sendMessage(message, gen_errors.no_such_item.format(Format.capitalizeFirsts(name)), syntax.sell); return; }
        if (entry.sellcost == '') { Format.sendMessage(message, Random.getRandomItem(messages.item_not_bought)); return; }
        let item = user.inventory[name];
        if (quantity == -1) quantity = item.quantity;
        if (item.quantity < quantity) { Format.sendMessage(message, gen_errors.not_enough_items); return; }
        item.quantity -= quantity;
        if (item.quantity == 0) delete user.inventory[name];
        user.profile.gold += parseInt(entry.sellcost) * quantity;
        Format.formatConfirmation(message, 'Sale', messages.sell_initiate.format(quantity,
          Format.capitalizeFirsts(name), parseInt(entry.sellcost) * quantity, item == undefined ? 0 : item.quantity),
          Format.formatSellReply, [user, name, quantity]);
      }
    })
  }
};