const Format = require("../utils/format.js");
const Item = require('./item.js');
const updateUTIL = require('../utils/update.js');
const userUTIL = require('../utils/user.js');
const DB = require('../utils/db.js');
const rolesUTIL = require('../utils/roles.js');
const Dungeon = require("../classes/dungeon.js");

class CombatController {
  static resolveStats(amount, target, stat, isuser, userCombat = undefined) {
    switch (stat) {
      case 'HP':
        if (target.hp + amount > target.maxhp) target.hp = target.maxhp;
        else target.hp += amount;
        break;
      case 'Turn':
        if (isuser) userCombat.turn = false;
        else target.turn = false;
        break;
    }
    return [target, userCombat];
  }

  static hasSE(target, id) {
    for (let i = 0; i < target.stateffects.length; i++) {
      if (target.stateffects[i].move_id == id) return i;
    }
    return -1;
  }

  // Combat sum is as follows: [user] + summary1 (action) + [target] + summary2 + [amount] + summary3 (stat name)
  static parseAction(usercasted, player, monster, players, monsters, action, chain, item, prevamnt) {
    var naction = Object.assign({}, action);
    const stat = action.stat_id == '' ? undefined : DB.stat_effects.get(action.stat_id).name;
    var combatsum = "";
    var amnt = 0;
    // -1 = affect player party, 1 = affect monster party
    var affectall = 0;
    var pupdate = false;
    var chain = false;
    switch (action.base) {
      case 'max_hp':
        if (action.target == 'user') {
          if (usercasted) {
            if (action.source == 'user') {
              amnt = Math.ceil(player.usergp.profile.maxhp * action.stat_change);
              player.usergp.profile = this.resolveStats(amnt, player.usergp.profile, stat, true, player.combat)[0];
              pupdate = true;
            }
          }
        }
        break;
      case 'potency':
        if (action.side == 'other') {
          if (usercasted) {
            if (action.target == 'single') {
              if (action.source == 'user') {
                if (action.status_effect == 'true') {
                  const index = this.hasSE(monster, action.move_id);
                  if (index >= 0) {
                    var se = monster.stateffects[index];
                    se.caster = player.id;
                    if (typeof se.stacks == 'string') se.stacks = parseInt(se.stacks);
                    if (typeof action.stacks == 'string') action.stacks = parseInt(action.stacks);
                    if (se.decay == 'true') se.stacks = action.stacks;
                    else {
                      if (se.stacks + action.stacks < action.maxstacks) se.stacks += action.stacks;
                      else se.stacks = action.maxstacks;
                    }
                    monster.stateffects[index] = se;
                  } else {
                    naction.caster_id = player.id;
                    monster.stateffects.push(naction);
                  }
                }
                if (action.type == 'physical') {
                  amnt = Math.ceil(player.usergp.profile.physdmg * parseFloat(action.stat_change));
                } else if (action.type == 'magic') {
                  amnt = Math.ceil(player.usergp.profile.magicdmg * parseFloat(action.stat_change));
                }
                monster = this.resolveStats(amnt, monster, stat, false, player.combat)[0];
              }
            } else if (action.target == 'all') {
              if (action.source == 'user') {
                affectall = 1;
                if (action.status_effect == 'true') {
                  for (let i = 0; i < monsters.length; i++) {
                    var monster = monsters[i];
                    const index = this.hasSE(monster, action.move_id);
                    if (index >= 0) {
                      var se = monster.stateffects[index];
                      se.caster = player.id;
                      if (se.decay == 'true') se.stacks = action.stacks;
                      else se.stacks += action.stacks;
                      monster.stateffects[index] = se;
                    } else {
                      naction.caster_id = player.id;
                      monster.stateffects.push(naction);
                    }
                    monsters[i] = monster;
                    naction = Object.assign({}, action);
                  }
                }
                if (action.type == 'physical') {
                  amnt = Math.ceil(player.usergp.profile.physdmg * parseFloat(action.stat_change));
                } else if (action.type == 'magic') {
                  amnt = Math.ceil(player.usergp.profile.magicdmg * parseFloat(action.stat_change));
                }
                for (let i = 0; i < monsters.length; i++) {
                  monsters[i] = this.resolveStats(amnt, monsters[i], stat, false)[0];
                }
              }
            }
          }
        }
        break;
      case 'dmgdealt':
        if (action.side == 'user') {
          if (usercasted) {
            if (prevamnt < 0) prevamnt *= -1;
            amnt = Math.ceil(prevamnt * parseFloat(action.stat_change));
            player.usergp.profile = this.resolveStats(amnt, player.usergp.profile, stat, true, player.combat)[0];
            pupdate = true;
          }
        }
        break;
      // Non-damage dealing status effect (apply to self as buff or onto target as debuff)
      case '':
        if (action.side == 'other') {
          if (usercasted) {
            if (action.status_effect == 'true') {
              naction.caster_id = player.id;
              monster.stateffects.push(naction);
            }
            var r = this.resolveStats(action.stat_change, monster, stat, false, player.combat);
            monster = r[0];
          }
        } else if (action.side == 'user') {
          if (usercasted) {
            if (action.status_effect == 'true') {
              const index = this.hasSE(player.combat, action.move_id);
              if (index >= 0) {
                var se = player.combat.stateffects[index];
                se.caster = player.id;
                if (se.decay == 'true') se.stacks = action.stacks;
                else {
                  if (se.stacks + action.stacks < action.maxstacks) se.stacks += action.stacks;
                  else se.stacks = action.maxstacks;
                }
                player.combat.stateffects[index] = se;
              } else {
                naction.caster_id = player.id;
                player.combat.stateffects.push(naction);
              }
            }
          }
        }
        break;
    }
    const mon_name = "(" + monster.id + ") " + monster.name + " ";
    const desc = DB.a_desc.get(action.move_id);
    if (action.status_effect == 'false') {
      if (item) {
        combatsum += player.tag + DB.a_desc.get(action.move_id).verb + amnt + stat + " with " + action.name + ". ";
      } else {
        if (usercasted) {
          if (desc.chain == "") combatsum += player.tag + desc.verb + (action.side == 'other' ? action.target == 'single' ? mon_name : " all enemies " :
            action.side == 'user' ? "" : " all party members ") + "for " + amnt + " " + stat + " with " + desc.name + ". ";
          else {
            combatsum += " and " + desc.verb + (desc.noun == "" ? "" : desc.noun + (action.side == "user" ? "" : " to ")) +
              (action.target == 'single' ? (desc.noun == "" ? mon_name : "") : " all enemies ") + "for " +
              amnt + " " + stat + " with " + desc.chain + ". ";
            chain = true;
          }
        }
        if (chain != undefined && chain.status_effect == 'true') {
          var name = DB.a_desc.get(chain.move_id).name;
          if (chain.side == 'other') combatsum += "Inflicted ";
          else combatsum += "Granted ";
          if (chain.decay == 'true') combatsum += name + " for " + chain.stacks + " turns.";
          else combatsum += chain.stacks + " stacks of " + name + ".";
        }
      }
    }
    return [combatsum, player, pupdate, monster, players, monsters, affectall, chain, amnt];
  }

  static parseSE(floor, target, isuser, userCombat = undefined) {
    var comsum = [];
    for (let i = 0; i < target.stateffects.length; i++) {
      var effect = target.stateffects[i];
      const desc = DB.a_desc.get(effect.move_id);
      // Only decaying status effects affect stats
      if (effect.decay == 'true') {
        if (effect.base == 'potency') {
          const stat = DB.stat_effects.get(effect.stat_id);
          if (!isuser) {
            const user = floor.dungeon.getUserInParty(effect.caster_id);
            var amnt;
            if (effect.type == 'physical') amnt = Math.ceil(user.usergp.profile.physdmg * parseFloat(effect.stat_change));
            else if (effect.type == 'magic') amnt = Math.ceil(user.usergp.profile.magicdmg * parseFloat(effect.stat_change));
            var r = this.resolveStats(amnt, target, stat.name, isuser, userCombat);
            target = r[0];
          }
          comsum.push(target.name + desc.verb + "for " + amnt + " " + stat.name + ".");
        } else {
          comsum.push(target.name + desc.summary);
        }
        if (typeof effect.stacks == 'string') effect.stacks = parseInt(effect.stacks);
        effect.stacks -= 1;
        if (effect.stacks <= 0) {
          if (effect.move_id == 6) target.unstun = true;
          target.stateffects.splice(i, 1);
        }
        if (!isuser && target.hp <= 0) {
          target.dead = true;
          floor.monstersalive -= 1;
          comsum[i] += " (" + target.id + ") [" + target.name + " has fallen.]";
          break;
        }
      }
    }
    return [target, comsum];
  }

  static resolveCombat(pid, floor, channel, users) {
    var combatsum = [];
    var args = [];
    var pupdates = [];

    // Parse user actions
    for (let i = 0; i < users.length; i++) {
      var user = users[i];
      pupdates[i] = false;
      const queue_length = user.combat.actionqueue.length;
      var lastamnt = 0;
      if (user.combat.turn && queue_length == 0) {
        combatsum.push(user.tag + " did nothing this turn.");
      }
      for (let i = 0; i < queue_length; i++) {
        args = user.combat.actionqueue[i].trim().split(/ +/);
        let action;
        var monster = undefined;
        if (args[0] == 'use') {
          var consum = user.usergp.equipped.consumables;
          action = Object.assign({}, consum[args[1] - 1]);
          consum[args[1] - 1].quantity -= 1;
          if (consum[args[1] - 1].quantity == 0) {
            consum.splice(args[1] - 1, 1);
          }
        } else if (args[0] == 'do') {
          var abils = user.usergp.equipped.abilities;
          action = Object.assign({}, abils[args[1] - 1]);
          if (args.length >= 3 && args[2] != '') {
            monster = floor.monsters[args[2] - 1];
          }
        }
        while (action != undefined) {
          var chain = DB.a_meta.get(action.chain_id);
          var result = this.parseAction(true, user, monster, users, floor.monsters, action, chain, args[0] == 'use', lastamnt);
          lastamnt = result[8];
          if (result[2]) pupdates[i] = true;
          user = result[1];
          if (result[6] == 1) {
            floor.monsters = result[5];
            if (chain != undefined) {
              chain = Object.assign({}, chain);
              chain.target = 'all';
            }
          }
          else if (monster != undefined) {
            monster = result[3];
            floor.monsters[args[2] - 1] = monster;
          }
          if (monster != undefined && !monster.dead && monster.hp <= 0) {
            monster.dead = true;
            floor.monstersalive -= 1;
            result[0] += " (" + monster.id + ") [" + monster.name + " has fallen.]";
          }
          if (result[0] != '') {
            if (result[7] == true) {
              var str = combatsum[combatsum.length - 1];
              str = str.substring(0, str.lastIndexOf(" with"));
              str += result[0];
              combatsum[combatsum.length - 1] = str
            } else {
              combatsum.push(result[0]);
            }
          }
          action = chain;
        }
      }
      user.combat.done = false;
      users[i] = user;
    }
    // TODO: Complete monster combat here 
    for (let i = 0; i < floor.monsters.length; i++) {
      var monster = floor.monsters[i];
      if (!monster.dead) {
        var result = this.parseSE(floor, monster, false);
        floor.monsters[i] = result[0];
        if (result[1].length != 0) combatsum = combatsum.concat(result[1]);
        if (!monster.dead) {
          if (monster.turn) {

          } else if (monster.unstun) monster.turn = true; monster.unstun = false;
        }
      }
    }

    // Check if floor has been completed
    if (floor.monstersalive == 0) {
      if (!floor.bossroom) {
        floor.initRoom();
      } else {
        floor.cleared = true;
      }
    }

    // Update user profiles if necessary
    for (let i = 0; i < users.length; i++) {
      var user = users[i];
      if (floor.cleared) {
        var set = DB.equipment.get("d" + floor.dungeon.type.id);
        var item = Item.makeItem(parseInt(set.coffer_id), 1);
        item.dungeonid = floor.dungeon.type.id;
        userUTIL.updateItem(item, user.usergp.inventory);
        user.usergp.profile.gold += parseInt(floor.dungeon.type.gold);
        user.usergp.profile.dungeons_completed += 1;
        user.usergp.busy = '';
        Dungeon.removeDungeon(floor.dungeon);
      }
      else {
        if (user.combat.ap + 5 <= 15 + user.combat.bonusap) user.combat.ap += 5;
        user.combat.actionqueue = [];
        user.combat.used = new Map();
      }
      if (pupdates[i] || floor.cleared) {
        updateUTIL.updateUser(user.id, user.usergp.lastmsg, user.usergp.busy, user.usergp.partyid, user.usergp.inventory, user.usergp.equipped, user.usergp.profile, user.usergp.profile.hp);
      }
    }
    Format.formatDungeonSummary(combatsum, channel);
    floor.dungeon.partyList[pid] = users;
    if (floor.cleared) {
      setTimeout(function () { Format.formatDungeonResults(floor, channel) }, 3500);
      setTimeout(function () {
        var user_r = [];
        for (let user of users) {
          user_r.push(channel.guild.members.cache.get(user.id));
        }
        rolesUTIL.removeRole(user_r, floor.dungeon.roles[pid]);
        Dungeon.removeDungeon(floor.dungeon);
      }, 63500);
    } else {
      setTimeout(function () { Format.formatDungeonCombat(floor, channel, users); }, 3500);
    }
  }

}
module.exports = CombatController;
