const Discord = require('discord.js');
const userUTIL = require('../../utils/user.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const updateUTIL = require('../../utils/update.js');
require('dotenv').config();
const prefix = process.env.PREFIX;

module.exports = {
  name: 'advance',
  aliases: ['adv'],
  description: 'Narrow down on your specialty and become even stronger!',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      if (user.busy == 'dungeon') { Format.sendUserMessage(message, 'busydungeon'); return; }
      if (user.level < 10) {
        console.log("Error: Player is not at least level 10. Cannot advance class.");
        Format.sendAdvanceMessage(message, 'insufflevel');
        return;
      }
      console.log("Success: Player is at least level 10. Can continue advance class.");
      user = Format.formatAdvance(message, user);
    })
  }
};