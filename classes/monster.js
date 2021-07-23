const DB = require('../utils/db.js');

class Monster {

  static UNIQUE = {
    goblin_group: 0
  }

  id;
  name;
  hp;
  dead;
  maxhp;
  stateffects;
  turn;
  ability;
  unstun;
  lesser;
  boss;

  /** 
  * Returns a random integer betweem min and max-1.
  * 
  * @param {*} min the minimum number the random generator can return
  * @param {*} max the maximum number the random generator can return
  */
  static getRandomInt(min = 0, max) {
    return Math.floor(Math.random() * max) + min;
  }

  setStats(entry) {
    this.name = entry.name;
    this.hp = parseInt(entry.hp);
    this.dead = false;
    this.maxhp = parseInt(entry.hp);
    this.stateffects = [];
    this.unstun = false;
    this.turn = true;
    this.castCD = entry.ability_cooldown;
  }

  /**
   * Returns a monster created taking into consideration any unique circumstances.
   * 
   * @param {*} spawned   the number of monsters spawned so far
   * @param {*} lesser    whether this monster is a lesser monster
   * @param {*} boss      whether this monster is a boss
   * @param {*} type      the type of the dungeon 
   * @param {*} unique    any unique circumstances
   */
  constructor(spawned, lesser, boss, type, unique) {
    this.id = spawned + 1;
    var dungeon = DB.monsters[type.id];
    var monsters;
    this.lesser = false;
    this.boss = false;
    if (boss) { monsters = dungeon.boss; this.boss = true; }
    else if (lesser) { monsters = dungeon.lesser; this.lesser = true; }
    else monsters = dungeon.greater;
    let keys = Object.keys(monsters);
    let name = keys[Monster.getRandomInt(0, keys.length)];
    switch (unique) {
      case Monster.UNIQUE.goblin_group:
        if (Monster.getRandomInt(0, 10) < 7) this.setStats(dungeon.lesser['goblin']);
        else this.setStats(monsters[name]);
        break;
      default:
        this.setStats(monsters[name]); break;
    }
  }
}

module.exports = Monster;