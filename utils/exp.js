const DB = require('./db.js');
const updateUTIL = require('./update.js');
const userUTIL = require('./user.js');
require('dotenv').config();

// Default amount of EXP that players get per message
const BASE = 5;
const MAX_LEVEL = 25;
exports.eMAX_LEVEL = MAX_LEVEL;
const EXP_MSG_CD = 6000;

exports.grantEXP = async (message, exp = BASE, multi = 1) => {
  userUTIL.userData(message.author.id, userUTIL.eREQUESTS.OPTIONAL).then(function (user) {
    if (user == null || user.profile.level == MAX_LEVEL || message.createdTimestamp - user.lastmsg < EXP_MSG_CD) return;
    console.log("Success: Received user data");
    var req = DB.exp[user.profile.level - 1];
    var curr_exp = user.profile.exp + exp * multi;
    var add_level = 0;
    while (curr_exp >= req && user.profile.level + add_level <= MAX_LEVEL) {
      curr_exp -= req;
      add_level += 1;
      req = DB.exp[user.profile.level + add_level - 1];
    }
    var profile = {
      achievements: user.profile.achievements,
      date_joined: user.profile.date_joined,
      dungeons_completed: user.profile.dungeons_completed,
      exp: curr_exp,
      job: user.profile.job,
      level: user.profile.level + add_level,
      gold: user.profile.gold,
      nickname: user.profile.nickname,
      title: user.profile.title,
      hp: (add_level > 0 ? undefined : user.profile.hp),
      maxhp: (add_level > 0 ? undefined : user.profile.maxhp),
      magicdmg: user.profile.magicdmg,
      physdmg: user.profile.physdmg,
      raids_completed: user.profile.raids_completed
    };
    updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, profile, add_level > 0 ? undefined : user.hp);
    console.log("Success: User " + user.id + " has gained " + (exp * multi) + " (" + exp + "*" + multi + ") EXP. User now has " + curr_exp + " EXP.");
    if (add_level > 0) {
      message.channel.send("Congratulations, <@" + message.author.id + ">, you have advanced to level " + (user.profile.level + add_level) + "!");
      console.log("Success: User has advanced " + add_level);
    }
  })
}