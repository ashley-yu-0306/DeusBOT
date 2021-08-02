const gen_errors = require('../../data/messages.js').gen_errors;
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');

module.exports = {
  name: 'start',
  aliases: undefined,
  description: 'Start your journey as an adventurer!',
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.NONREQUIRE).then(function (user) {
      if (user != null) { Format.sendMessage(message, gen_errors.self_has_acc); return; }
      Format.formatStart(message);
    });
  }
};