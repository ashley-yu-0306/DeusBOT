const userUTIL = require('../../utils/user.js');
const Format = require('../../utils/format.js');
const gen_errors = require('../../data/messages.js').gen_errors;
const DB = require('../../utils/db.js');

module.exports = {
  name: 'advance',
  aliases: ['adv'],
  description: 'Narrow down on your specialty and become even stronger!',
  execute(message, args) {
    userUTIL.userData(message.author.id, userUTIL.eREQUESTS.REQUIRE).then(function (user) {
      if (user == null) { Format.sendMessage(message, gen_errors.self_no_acc); return; }
      if (user.data.busy == 'dungeon') { Format.sendMessage(message, gen_errors.self_busy_dungeon); return; }
      if (user.level < 10) { Format.sendMessage(message, gen_errors.req_level.format(10)); return; }
      if (!Object.keys(DB.p_pclasses).includes(user.profile.job)) { Format.sendMessage(message, gen_errors.has_advanced); return; }
      user = Format.formatAdvance(message, user);
    })
  }
};