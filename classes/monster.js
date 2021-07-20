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
    var dungeon = DB.monsters.get(type.id);
    var array;
    this.lesser = false;
    this.boss = false;
    if (boss) { array = Array.from(dungeon.boss.keys()); this.boss = true; }
    else if (lesser) { array = Array.from(dungeon.lesser.keys()); this.lesser = true; }
    else array = Array.from(dungeon.greater.keys());
    var name = array[Monster.getRandomInt(0, array.length)];
    var monster;
    if (boss) monster = dungeon.boss.get(name);
    else if (lesser) monster = dungeon.lesser.get(name);
    else monster = dungeon.greater.get(name);
    switch (unique) {
      case Monster.UNIQUE.goblin_group:
        if (Monster.getRandomInt(0, 10) < 7) this.setStats(dungeon.lesser.get('goblin'));
        else this.setStats(monster);
        break;
      default:
        this.setStats(monster); break;
    }
  }
}

module.exports = Monster;