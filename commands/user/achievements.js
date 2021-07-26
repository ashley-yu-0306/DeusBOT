const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');

module.exports = {
  name: 'achievements',
  aliases: ['ach', 'a', 'achievement'],
  description: "Display all possible achievements",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (args.length != 0 && isNaN(args[0])) { Format.sendUserMessage(message, 'enterachnumber'); return; }
      Format.formatAchievements(message, args, user);
    })
  }
};