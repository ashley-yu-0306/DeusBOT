const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const CONTENTS = ['equipment', 'weapons', 'armor', 'consumables', 'items']
const gen_errors = require('../../data/messages.js').gen_errors;

module.exports = {
  name: 'inventory',
  aliases: ['inv'],
  description: "Display the contents of the player's inventory.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      Format.formatInventory(message, args, CONTENTS, user);
    })
  }
};