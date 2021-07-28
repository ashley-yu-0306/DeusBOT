const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const messages = require('../../data/messages.js').nickname;

module.exports = {
  name: 'nick',
  aliases: undefined,
  description: 'Display information about your character.',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (args.length == 0) {
        user.profile.nickname = '';
        Format.sendMessage(message, messages.nick_remove);
      } else {
        if (args[0].length < 3) { Format.sendMessage(message, messages.nick_short); return; }
        if (args[0].length > 10) { Format.sendMessage(message, messages.nick_long); return; }
        const test = str => /^[\da-zA-Z]+$/.test(str);
        if (!test(args[0])) { Format.sendMessage(message, messages.nick_chars); return; }
        user.profile.nickname = args[0];
        Format.sendMessage(message, messages.nick_success.format(args[0]));
      }
      updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};