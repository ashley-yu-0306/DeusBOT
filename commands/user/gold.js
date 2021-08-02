const userUTIL = require('../../utils/user.js');
const Format = require('../../utils/format.js');
const gen_errors = require('../../data/messages.js').gen_errors;

module.exports = {
  name: 'gold',
  aliases: ['money', 'cash'],
  description: 'Display the amount of gold in your gold pouch.',
  execute(message, args) {
    userUTIL.userData(message.author.id).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      Format.formatGold(message, user);
    })
  }
};