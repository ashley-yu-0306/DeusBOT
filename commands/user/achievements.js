const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const messages = require('../../data/messages.js').achievements;
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;

module.exports = {
  name: 'achievements',
  aliases: ['ach', 'a', 'achievement'],
  description: "Display all possible achievements",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (args.length != 0 && isNaN(args[0])) { Format.sendMessage(message, messages.NaN.format(args[0]), syntax.achievements); return; }
      Format.formatAchievements(message, args, user, messages);
    })
  }
};