const Format = require('../../utils/format.js');

module.exports = {
  name: 'merchant',
  aliases: ['shop', 'store'],
  description: "Check out the merchant's wares!",
  execute(message, args) {
    Format.formatMerchant(message);
  }
};