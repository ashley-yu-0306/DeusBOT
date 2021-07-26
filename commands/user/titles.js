const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');

module.exports = {
  name: 'titles',
  aliases: ['title', 't'],
  description: "Display all titles that the player has equipped",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      Format.formatTitles(message, args, user.data.titles);
    })
  }
};