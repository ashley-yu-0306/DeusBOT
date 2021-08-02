const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;
const embeds = require('../../data/messages.js').embeds;

module.exports = {
  name: 'info',
  aliases: ['i'],
  description: "Display information about a certain item.",
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (args.length == 0) {
        let contents = [];
        for (let item of DB.items) {
          let id = parseInt(item.id) + 1;
          contents.push("`" + (id < 10 ? " " : "") + id + "`　" + Format.capitalizeFirsts(item.name));
        }
        Format.pagination(message, undefined, [undefined, undefined, 'Item List', contents]);
        return;
      }
      let name = args.join(" ");
      let entry = undefined;
      if (!isNaN(name)) entry = DB.items[parseInt(name) - 1];
      else for (let item of DB.items) if (item.name == name) { entry = item; break; }
      if (entry == undefined) { Format.sendMessage(message, gen_errors.no_such_item.format(Format.capitalizeFirsts(name)), syntax.buy); return; }
      let embed = Format.makeEmbed().setTitle(Format.capitalizeFirsts(entry.name))
        .setDescription(embeds.info.format(entry.origin, entry.tradeable == 'true' ? 'Yes' : 'No',
          entry.sellcost == '' ? '*Unsellable*' : entry.sellcost,
          "`" + entry.category1 + "`" + (entry.category2 != "" ? " `" +
            entry.category2 + "`" : ""), entry.description));
      message.channel.send(embed);
    })
  }
};