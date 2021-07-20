const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const userUTIL = require('../../utils/user.js');
require('dotenv').config();
const prefix = process.env.PREFIX;

module.exports = {
  name: 'start',
  aliases: undefined,
  description: 'Start your journey as an adventurer!',
  execute(message, args) {
    userUTIL.userData(message, userUTIL.eREQUESTS.NONREQUIRE).then(function (user) {
      if (user != null) { Format.sendUserMessage(message, 'haserror'); return; }
      console.log("Successfully beginning character creation.");
      Format.formatStart(message);
    });
  }
};