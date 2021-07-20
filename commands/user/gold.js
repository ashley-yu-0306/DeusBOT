const Discord = require('discord.js');
const DB = require('../../utils/db.js');
const userUTIL = require('../../utils/user.js');
const Format = require('../../utils/format.js');

module.exports = {
  name: 'gold',
  aliases: ['money', 'cash'],
  description: 'Display the amount of gold in your gold pouch.',
  execute(message, args) {
    userUTIL.userData(message).then(function (user) {
      if (user == null) { Format.sendUserMessage(message, 'finderror'); return; }
      Format.formatGold(message, user);
    })
  }
};