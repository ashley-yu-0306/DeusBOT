const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const updateUTIL = require('../../utils/update.js');

module.exports = {
  name: 'nick',
  aliases: undefined,
  description: 'Display information about your character.',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (args.length == 0) {
        user.profile.nickname = '';
        Format.sendUserMessage(message, 'nickremove', [args[0]]);
      } else {
        if (args[0].length < 3) { Format.sendUserMessage(message, 'nicklengthshort'); return; }
        if (args[0].length > 10) { Format.sendUserMessage(message, 'nicklengthlong'); return; }
        const test = str => /^[\da-zA-Z]+$/.test(str);
        if (!test(args[0])) { Format.sendUserMessage(message, 'charsonly'); return; }
        user.profile.nickname = args[0];
        Format.sendUserMessage(message, 'nicksuccess', [args[0]]);
      }
      updateUTIL.updateUser(user.id, user.lastmsg, user.busy, user.partyid, user.inventory, user.equipped, user.profile, user.profile.hp);
    })
  }
};