const DB = require('../../utils/db.js');
const userUTIL = require('../../utils/user.js');
const Format = require('../../utils/format.js');

module.exports = {
  name: 'level',
  aliases: ['lvl'],
  description: 'Display your current level and exp.',
  execute(message, args) {
    userUTIL.userData(message).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      Format.formatLevel(message, user, DB.exp_req[user.profile.level-1].exp);
    })
  }
};