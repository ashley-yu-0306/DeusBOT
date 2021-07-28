const DB = require('../../utils/db.js');
const userUTIL = require('../../utils/user.js');
const Format = require('../../utils/format.js');
const gen_errors = require('../../data/messages.js').gen_errors;

module.exports = {
  name: 'level',
  aliases: ['lvl'],
  description: 'Display your current level and exp.',
  execute(message, args) {
    userUTIL.userData(message).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      Format.formatLevel(message, user, DB.exp_req[user.profile.level - 1].exp);
    })
  }
};