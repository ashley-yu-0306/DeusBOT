const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const messages = require('../../data/messages.js').achievements;
const gen_errors = require('../../data/messages.js').gen_errors;
const syntax = require('../../data/messages.js').syntax;

module.exports = {
  name: 'explore',
  aliases: ['expl'],
  description: "Go on an exploration.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      Format.formatExplore(message, user);
    })
  }
};