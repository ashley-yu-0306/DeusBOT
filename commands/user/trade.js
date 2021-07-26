const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const Trading = require('../../classes/trading.js');

const subcommands = ['add', 'a', 'reset', 'r', 'confirm', 'c'];

module.exports = {
  name: 'trade',
  aliases: ['t'],
  description: 'Trade items or gold with another user.',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.data.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      if (args.length == 0) { Format.sendUserMessage(message, 'mentionuser'); return; }
      if (subcommands.includes(args[0])) {
        if (!user.data.busy.includes('trade')) { Format.sendUserMessage(message, 'notintrade'); return; }
        let trade_id = user.data.busy.slice('trade '.length);
        let trade = Trading.trades.get(trade_id);
        if (args[0] == 'add' || args[0] == 'a') {
          let quantity, name = '', index = 1;
          if (isNaN(args[1])) quantity = 1;
          else { quantity = parseInt(args[1]); index = 2; }
          for (let i = index; i < args.length; i++) name += args[i] + ' ';
          name = name.trim().toLowerCase();
          let trade_user = trade.user1.id == user.id ? trade.user1 : trade.user2;
          if (name == 'gold') {
            if (trade_user.gold_offer + quantity > user.profile.gold) { Format.sendUserMessage(message, 'notenoughgoldtrade'); return; }
            trade.updateGold(user.id, quantity);
            Format.formatTradeEmbed(trade);
          } else {
            let item = user.inventory[name];
            if (item == undefined) { Format.sendUserMessage(message, 'canttradenoitem'); return; }
            let entry = trade_user.item_offers[item.name];
            if ((entry == undefined ? 0 : entry.quantity) + quantity > item.quantity) { Format.sendUserMessage(message, 'notenoughitems'); return; }
            let add = Object.assign({}, item);
            add.quantity = quantity;
            trade.updateItem(user.id, add);
            Format.formatTradeEmbed(trade);
          }
        } else if (args[0] == 'reset' || args[0] == 'r') {
          if (args[1] == 'gold') trade.updateGold(user.id, _, true);
          else if (args[1] == 'items') trade.updateItem(user.id, _, _, true);
          else return;
          Format.formatTradeEmbed(trade);
        } else if (args[0] == 'confirm' || args[0] == 'c') {
          let done = trade.confirmTrade(user.id);
          Format.formatTradeEmbed(trade);
          if (done) {
            let target_id = trade_id.slice(0, trade_id.indexOf("_"))
            if (target_id == user.id)  target_id = trade_id.slice(trade_id.indexOf('_') + 1); 
            userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE, target_id).then(function (target_gp) {
              trade.finalizeTrade(user, target_gp);
              Format.sendUserMessage(message, 'tradecomplete');
            })
          }
        }
      } else {
        if (args[0].length < 10) return;
        let target_id = args[0].slice(3);
        target_id = target_id.slice(0, target_id.length - 1);
        if (target_id == user.id) { Format.sendUserMessage(message, 'tradeself'); return; }
        let target = message.guild.members.cache.get(target_id);
        if (target == undefined) return;
        userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE, target_id).then(function (target_gp) {
          if (target_gp == null) { Format.sendUserMessage(message, 'finderrorother'); return; }
          if (target_gp.data.busy == 'dungeon') { Format.sendUserMessage(message, 'targetbusydungeon'); return; }
          let string = args[0] + ", " + message.author.tag + " has invited you to a trade. Proceed?";
          Format.formatConfirmation(message, 'Trade', string, Format.formatTradeReply, [target.user.tag, target_id, target_gp, user], target_id, "Accept")
        })
      }
    })
  }
};