const Format = require('../../utils/format.js');

module.exports = {
  name: 'merchant',
  aliases: ['shop', 'store'],
  options: undefined,
  description: "Browse the items that the merchant has in stock.",
  execute(message, args) {
    Format.formatMerchant(message);
  }
};