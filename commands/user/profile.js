const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');

module.exports = {
  name: 'profile',
  aliases: ['pf'],
  description: 'Display information about your character.',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      Format.formatProfile(message, user);
    })
  }
};