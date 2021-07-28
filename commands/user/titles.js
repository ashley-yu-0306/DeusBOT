const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const gen_errors = require('../../data/messages.js').gen_errors;

module.exports = {
  name: 'titles',
  aliases: ['title', 't'],
  description: "Display all titles that the player has equipped",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      Format.formatTitles(message, args, user.data.titles);
    })
  }
};