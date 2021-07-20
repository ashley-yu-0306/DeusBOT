const Discord = require('discord.js');
const userUTIL = require('../../utils/user.js');
const DB = require('../../utils/db.js');
const Format = require('../../utils/format.js');
const updateUTIL = require('../../utils/update.js');
require('dotenv').config();
const prefix = process.env.PREFIX;

module.exports = {
  name: 'merchant',
  aliases: ['shop', 'store'],
  description: "Check out the merchant's wares!",
  execute(message, args) {
    Format.formatMerchant(message);
  }
};