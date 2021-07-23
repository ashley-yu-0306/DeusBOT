const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
const CONTENTS = ['equipment', 'weapons', 'armor', 'consumables', 'items']

module.exports = {
  name: 'inventory',
  aliases: ['inv'],
  description: "Display the contents of the player's inventory.",
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      Format.formatInventory(message, args, CONTENTS, user);
    })
  }
};