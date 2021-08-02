const Loot = require('../data/loot.js');
const Random = require('../classes/random.js');
const Item = require('../classes/item.js');
const DB = require('../utils/db.js');
const updateUTIL = require('../utils/update.js');
const userUTIL = require('../utils/user.js');

class Exploration {
  static STORY_CHANCE = 0.15; 
  static MIN_EVENTS = 3;
  static MAX_EVENTS = 4;
  static NEG_CHANCE = 0.1;
  static POS_CHANCE = 0.4;
  static NEU_CHANCE = 1;
  static RET_CHANCE = 0.5;
  static MARGIN = 5;
  static TANKS = ['Warrior', 'Holy Knight', 'Dark Knight'];
  static HEALERS = ['Priest'];
  static LEVEL_ADJUST = 0.06;


  static routes = {
    'road': {
      leave_description: 'The caravan decides that the journey has gone on for long enough and returns to the city.',
      pos_events: [
        {
          chance: 1,
          event_type: 'stat_change',
          description: 'The caravan approaches what appears to be an old campsite and ' +
            'takes the time to recover before setting out again.',
          stat_id: 1,
          stat_change: 0.25
        },
        {
          chance: 1,
          event_type: 'loot_change',
          description: 'A pair of travelers approach the caravan and offer gold for ' +
            'hospitality and protection until they return to the city. The caravan happily welcomes them.',
          reward_type: 'gold',
          reward_id: -1,
          reward_min: 350,
          reward_max: 570
        },
        {
          chance: 0.7,
          event_type: 'stat_change',
          description: 'A fairy flies next to you, examining the crew. It smiles and with ' +
            'a snap of its fingers, the caravan starts moving more quickly. Looks like ' +
            'the caravan can travel a larger distance now.',
          stat_id: 5,
          stat_change: 1
        },
        {
          chance: 0.5,
          event_type: 'loot_change',
          description: 'A traveling merchant can be seen advertising their wares in the ' +
            'distance. They offer the crew their blessings and gives the crew some of their inventory.',
          reward_type: 'loot_table',
          reward_id: 0,
          reward_min: 1,
          reward_max: 2
        },
        {
          chance: 0.3,
          event_type: 'loot_change',
          description: 'An abandoned wagon sits at the side of the road. The caravan stops and rummages ' +
            'through its goods. From the looks of it, its owner seemed to be quite wealthy.',
          reward_type: 'loot_table',
          reward_id: 1,
          reward_min: 2,
          reward_max: 3
        }
      ],
      neu_events: [
        {
          chance: 1,
          event_type: 'stat_compare',
          description: 'The caravan spots an older man carrying a log on his back. ' +
            'He seems to be struggling. ',
          stat_id: 5,
          stat_diff: 0.20,
          positive: '{0} pushes their sleeves up and gets out of the wagon to help him. ' +
            'The man is very grateful and offers the caravan gifts. ',
          negative: 'Unfortunately, no one on the crew is strong enough to help him.',
          reward_target: 'all',
          reward_type: 'loot_table',
          reward_id: 3,
          reward_min: 2,
          reward_max: 2
        },
        {
          chance: 1,
          event_type: 'stat_compare',
          description: 'The caravan spots two children who appear to be attempting a ' +
            'magic spell to no avail. ',
          stat_id: 7,
          stat_diff: 0.20,
          positive: 'Well versed in magic, {0} gets out of the wagon to offer them some tips. ' +
            'Their mother is very thankful and offers the caravan gifts.',
          negative: 'Unfortunately, no one on the crew knows enough magic.',
          reward_target: 'all',
          reward_type: 'loot_table',
          reward_id: 4,
          reward_min: 2,
          reward_max: 2
        },
        {
          chance: 0.4,
          event_type: 'stat_compare',
          description: 'A lone adventurer on the caravan nudges {0}, explaining that he ' +
            'has had a good day adventuring today. He offers to give them a treaasure ' +
            'if they can answer a riddle. ',
          stat_id: 6,
          stat_req: 70,
          positive: '{0} answers the riddle with ease, and the man is impressed, giving them the treasure he promised.',
          negative: 'Unfortunately, {0} looks perplexed. Maybe next time.',
          reward_target: 'target',
          reward_type: 'loot_table',
          reward_id: 5,
          reward_min: 1,
          reward_max: 1
        },
        {
          chance: 0.7,
          event_type: 'stat_compare',
          description: 'A pixie flies quickly towards the caravan, ripping ' +
            'onto a small coin pouch and chuckling. A person can be seen in the distance, ' +
            'seemingly chasing the pixie. As it flies over the caravan, {0} attempts to ' +
            'grab the pouch. ',
          stat_id: 6,
          stat_req: 50,
          positive: 'Fortunately, they were able to grab onto the pouch. The pixie disappears. ' +
            'The person catches up, tired, but thankful, and offers the caravan some gold.',
          negative: 'Unfortunately, they missed, and the pixie flies into the distance. ' +
            'The person stops running and seems disappointed.',
          reward_target: 'all',
          reward_type: 'gold',
          reward_id: -1,
          reward_min: 400,
          reward_max: 600
        },
        {
          chance: 0.3,
          event_type: 'route',
          description: 'The caravan stops in a small town. You and your crew decide to look around town.',
          route: 'small_town'
        }
      ],
      neg_events: [
        {
          chance: 0.10,
          event_type: 'purge',
          description: 'A large group of bandits charge towards the caravan on horseback, demanding ' +
            'everything that the caravan has. The driver, afraid, urges all the passengers to ' +
            'listen to the thieves.',
        },
        {
          chance: 1,
          enemies: 3,
          event_type: 'combat',
          description: 'The caravan runs into a group of forest goblins. They stop what they are ' +
            'doing and approach the caravan. You and your crew fight them off. '
        }
      ]
    },
    'small_town': {
      leave_chance: 0.6,
      leave_description: 'The caravan regroups, leaving the small town.',
      pos_events: [
        {
          event_type: 'stat_compare',
          chance: 1,
          stat_id: -1,
          stat_diff: -100,
          description: '{0} notices an old lady carrying baskets of fruit and ' +
            'steps in, helping her get home. At the destination, they realize that ' +
            'her family owns a jewelry store. Her son immediately comes out and carries ' +
            'the baskets inside. He gifts {0} one of their works as thanks. ',
          positive: '',
          negative: '',
          reward_type: 'loot_table',
          reward_target: 'target',
          reward_id: 2,
          reward_min: 1,
          reward_max: 1
        }
      ],
      neu_events: [
        {
          chance: 1,
          event_type: 'stat_compare',
          description: 'Loud cheers come from the center of the town as a gladiator puffs his chest. He seems ' +
            'to have won three arm-wrestling matches in a row. The reward for beating ' +
            'him is a hefty sum of gold. Your crew jokes around and decides to volunteer ' +
            '{0} to be his next opponent. ',
          stat_id: -1,
          stat_diff: 1,
          positive: '{0} wins the match and the crowd roars, chanting the name of their new champion.',
          negative: '{0} loses the match and the crowd cheers for the long-standing ' +
            'champion. The crew comforts {0} as they leave the square.',
          reward_target: 'target',
          reward_type: 'gold',
          reward_min: 900,
          reward_max: 1500
        }
      ],
      neg_events: [
        {
          chance: 1,
          event_type: 'loot_change',
          description: 'Two kids dressed in raggy clothing bump into the crew as they walk ' +
            'down the street. They apologize and run away quickly. You quickly notice that they ' +
            'have stolen some of your gold.',
          reward_type: 'gold',
          reward_min: -150,
          reward_max: -300
        },
        {
          chance: 0.30,
          event_type: 'route',
          description: 'The crew accidentally runs into a druggard, aggrivating him. He starts ' +
            'shouting at the crew and raises his fists. Guards immediately intervene and separate ' +
            'the crew from the druggard. They tell you that you will have to leave.',
          route: 'road'
        }
      ]
    }
  }

  static grantLoot(event, gold, loot, target) {
    if (event.reward_type == 'gold') gold += Random.getRandomInt(event.reward_min, event.reward_max);
    else if (event.reward_type == 'loot_table') {
      for (let i = 0; i < Random.getRandomInt(event.reward_min, event.reward_max); i++) {
        let item = Random.getFromChance(Loot.exploration_loot[event.reward_id]);
        let amount = Random.getRandomInt(item.min, item.max);
        if (item.item_id == -1) {
          if (target == undefined || event.reward_target == 'all') gold += amount;
          else target.usergp.profile.gold += amount;
        }
        else {
          if (target == undefined || event.reward_target == 'all') loot.push(Item.makeItem(item.item_id, amount));
          else {
            let item_entity = Item.makeItem(item.item_id, amount);
            userUTIL.updateItem(item_entity, target.usergp.inventory);
            loot.push(target.tag + " has received " + item.name + " from an NPC!");
          }
        }
      }
    }
    if (gold < 0) gold = 0;
    return gold;
  }

  static resolveStats(user, event) {
    switch (event.stat_id) {
      case 1:
        user.usergp.profile.hp += event.stat_change;
        if (user.usergp.profile.hp > user.usergp.profile.maxhp) {
          user.usergp.profile.hp = user.usergp.profile.maxhp
        } else if (user.usergp.profile.hp <= 0) return user;
        break;
    }
  }

  static resolveCombat(users, tanks, healers, exp_level, event) {
    let summary = "";
    let shield = 0, npc_level = Random.getRandomInt(exp_level - this.MARGIN, exp_level + this.MARGIN),
      hpbase = 0.7 * parseInt(DB.p_stats['HPbase'][npc_level < 10 ? 'prim_avg' : 'adv_avg']),
      hpgs = 0.7 * parseInt(DB.p_stats['HPgs'][npc_level < 10 ? 'prim_avg' : 'adv_avg']),
      damage = Math.ceil(0.15 * (hpbase + (hpgs * (npc_level - 1) * (0.7025 + (0.0175 * (npc_level - 1)))) *
        event.enemies));
    if (tanks.length == 0) {
      damage = damage / users.length;
      summary += "With no warriors present, the enemies swarm the crew. ";
    } else {
      damage = damage / tanks.length;
      summary += "The warrior(s) stand front, protecting the rest of the crew from the incoming enemies. "
    }
    if (healers.length != 0) {
      summary += "The healer(s) shields the party to lessen the brunt of the attack. ";
      for (let healer of healers) {
        let user = users[healer], potency = user.usergp.profile.magicdmg * 2.1;
        potency *= 1 + (this.LEVEL_ADJUST(user.level - npc_level));
        shield += potency;
      }
    }
    if (tanks.length != 0) {
      shield /= tanks.length;
      for (let tank of tanks) {
        let user = users[tank];
        user.usergp.profile.hp -= damage * (1 + (this.LEVEL_ADJUST * (npc_level - user.usergp.profile.level))) - shield;
        if (user.usergp.profile.hp <= 0) {
          user.usergp.profile.hp = 1;
          summary += "During the fight, " + user.tag + " falls. "
          return [summary, user];
        }
      }
    } else {
      shield /= users.length;
      for (let user of users) {
        user.usergp.profile.hp -= damage * (1 + (this.LEVEL_ADJUST * (npc_level - user.usergp.profile.level))) - shield;
        if (user.usergp.profile.hp <= 0) {
          user.usergp.profile.hp = 1;
          summary += "During the fight, " + user.tag + " falls. "
          return [summary, user];
        }
      }
    }
    summary += "The crew successfully wards off the enemies. The caravan rejoices."
    return [summary, undefined];
  }

  static resolveCompare(target, event, exp_level) {
    let success = false;
    let enc_level = Random.getRandomInt(exp_level - this.MARGIN, exp_level + this.MARGIN),
      enc_pdmg = enc_level >= 10 ? DB.p_stats['PHYSbase']['adv_avg'] : DB.p_stats['PHYSbase']['prim_avg'],
      enc_mdmg = enc_level >= 10 ? DB.p_stats['MAGICbase']['adv_avg'] : DB.p_stats['MAGICbase']['prim_avg'];
    switch (event.stat_id) {
      case -1: success = target.usergp.profile.level > enc_level - event.stat_diff; break;
      case 5: success = target.usergp.profile.physdmg * (1 - event.stat_diff) > enc_pdmg; break;
      case 7: success = target.usergp.profile.magicdmg * (1 - event.stat_diff) > enc_mdmg; break;
      case 6: success = Random.getRandomInt(1, 100) > event.stat_req; break;
    }
    console.log(event);
    let string = " - " + event.description;
    if (success) string += event.positive;
    else string += event.negative;
    string = string.format(target.tag);
    return [string, success];
  }

  static explore(users, exp_level) {
    let tanks = [], healers = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      if (this.TANKS.includes(user.usergp.profile.job)) tanks.push(i);
      else if (this.HEALERS.includes(user.usergp.profile.job)) healers.push(i);
    }
    let summary = [], loot = [], gold = 0, route = 'road', morale = 0, leave_roll = 0, event_count = 0,
      route_event_count = 0, fallen = undefined, extra_turns = 0;
    while (((route != 'road') || (route == 'road' && event_count <= this.MAX_EVENTS + extra_turns)) &&
      (event_count < this.MIN_EVENTS || route != 'road' || (route == 'road' && leave_roll > this.RET_CHANCE))) {
      leave_roll = Random.getRandomInt(0, 1, true);
      if (route != 'road') {
        route_event_count++;
        if (event_count >= this.MAX_EVENTS + extra_turns - 1 || (route_event_count > 3 && leave_roll < this.routes[route].leave_chance)) {
          summary.push(" - " + this.routes[route].leave_description);
          route = 'road';
          route_event_count = 0;
          continue;
        }
      }
      let valid_events = this.routes[route][Random.getFromChance(['neg_events', 'neu_events', 'pos_events'],
        [this.NEG_CHANCE, this.NEU_CHANCE, this.POS_CHANCE])];
      let event = Random.getFromChance(valid_events), results;
      summary.push(" - " + event.description);
      switch (event.event_type) {
        case 'route': route = event.route; break;
        case 'purge': gold = 0; loot = []; break;
        case 'loot_change': gold = this.grantLoot(event, gold, loot); break;
        case 'stat_compare':
          let target = Random.getRandomItem(users);
          results = this.resolveCompare(target, event, exp_level);
          summary[summary.length - 1] = results[0];
          if (results[1]) gold = this.grantLoot(event, gold, loot, target)
          break;
        case 'stat_change':
          switch (event.stat_id) {
            case 4: morale += event.stat_change; break;
            case 5: extra_turns += 1; break;
            default: for (let user of users) this.resolveStats(user, event); break;
          }
          break;
        case 'combat':
          results = this.resolveCombat(users, tanks, healers, exp_level, event);
          summary[summary.length - 1] = summary[summary.length - 1] + (results[0]);
          fallen = results[1];
          break;
      }
      event_count++;
      if (fallen != undefined) {
        let string = summary[summary.length - 1];
        string += "In a panic, the crew carries {0} onto the wagon, ".format(fallen.tag) +
          "leaving hastily towards the city.";
        summary[summary.length - 1] = string;
        break;
      }
    }
    if (fallen == undefined) summary.push(" - " + this.routes['road'].leave_description);
    let loot_summary = [];
    for (let item of loot) {
      let string = "";
      if (typeof item == 'string') { loot_summary.push(item); continue; }
      if (users.length == 1) {
        string = "{0} has obtained [{1}x {2}].".format(users[0].tag, item.quantity, item.name);
        userUTIL.updateItem(item, users[0].usergp.inventory);
      }
      else {
        string = "Rolling for [{0}x {1}]. ".format(item.quantity, item.name);
        let max_roll = 0, index = 0;
        for (let i = 0; i < users.length; i++) {
          let roll = Random.getRandomInt(1, 100);
          string += "{0} has rolled a {1} ".format(users[i].tag, roll);
          if (roll > max_roll) { max_roll = roll; index = i; }
        }
        string += "{0} wins the item.".format(users[index].tag);
        userUTIL.updateItem(item, user.usergp.inventory);
      }
      loot_summary.push(string);
    };
    loot_summary.push("Each user has obtained {0} gold.".format(Math.floor(gold / users.length)));
    for (let user of users) {
      user.usergp.profile.gold += Math.floor(gold / users.length);
      user.usergp.data.busy = '';
      updateUTIL.updateUser(user.usergp.id, user.usergp.lastmsg, user.usergp.data,
        user.usergp.inventory, user.usergp.equipped, user.usergp.profile,
        user.usergp.profile.hp);
    }
    console.log(summary)
    return [summary, loot_summary];
  }
}

module.exports = Exploration;