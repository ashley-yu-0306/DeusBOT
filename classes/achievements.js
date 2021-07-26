const events = require('../data/events.js').events;
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];
const DB = require('../utils/db.js');
const updateUTIL = require('../utils/update.js');

class Achievements {
  static makeEventData(event) {
    let data = {};
    data.curr_tier = 0;
    if (event.types != undefined) {
      data.types_count = [];
      for (let i = 0; i < event.types.length; i++) { data.types_count.push(0); data.types_bits = 0; }
    }
    data.count = 0;
    return data;
  }

  static grant(message, user, ach_data, tier, type) {
    console.log(" ")
    let reward = ach_data.tier_rewards[tier];
    console.log("reward")
    console.log(reward)
    let string = "You have unlocked achievement [" + ach_data.name + " " +
      ROMAN_NUMERALS[tier - 1] + "]!";
    if (reward != undefined) {
      console.log("isnan?")
      console.log(isNaN(reward))
      if (isNaN(reward)) reward = reward[type];
      console.log("reward2")
      console.log(reward)
      string += " Obtained ";
      if (ach_data.reward_type == 'title') {
        string += "title [";
        let title = DB.titles[reward].title;
        string += title + "].";
        user.data.titles.push(title);
        console.log(title);
        message.channel.send(string);
      }
    }
    return user;
  }

  static triggerEvent(message, user, event_name, type, count) {
    let event = events[event_name];
    console.log(event)
    let user_event = user.data.event_data[event_name];
    if (user_event == undefined) {
      let data = Achievements.makeEventData(event);
      user.data.event_data[event_name] = data;
      user_event = data;
      console.log(user.data);
    }
    let ach_data = event.achievement;
    console.log("user event")
    console.log(user_event)
    console.log("types count")
    console.log(user_event.types_count)
    console.log(type)
    console.log(type);


    if (ach_data != undefined) {
      console.log("achievement exists")
      if (user_event.curr_tier != ach_data.tiers) {
        console.log("user not done")
        if (type != undefined) {
          let type_index = event.types.indexOf(type);
          console.log("type_index")
          console.log(type_index)
          let mask = 1 << type_index;
          if ((user_event.types_bits & mask) == 0) {
            console.log("not completed type")
            user_event.types_count[type_index] += count;
            if (user_event.types_count[type_index] >= ach_data.type_ths[type_index]) {
              console.log("type now completed")
              user_event.types_bits = user_event.types_bits | mask;
              user_event.count += 1;
              if (user_event.count >= ach_data.ths[user_event.curr_tier]) {
                console.log("tier now completed")
                user_event.curr_tier += 1;
                user.data.achievement_prog[ach_data.id] = user_event.curr_tier;
                user = Achievements.grant(message, user, ach_data, user_event.curr_tier, type);
                if (user_event.curr_tier == ach_data.tiers) user.profile.achievement_count += 1;
                updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, user.profile.hp);
              }
            }
          }
        }
      }
    }
  }
}

module.exports = Achievements;