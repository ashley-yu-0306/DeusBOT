const exp = require('../utils/exp.js');
const DB = require('../utils/db.js');
const Monster = require('./monster.js');

class Dungeon {
  // time before a new dungeon can spawn after one had already spawned
  static DUNGEON_COOLDOWN = 900000;
  // Assuming conditions are met, there is a 1/DUNGEON_CHANCE chance that a dungeon will spawn.
  static DUNGEON_CHANCE = 7;
  // 10000 (time before trying to spawn new dungeon)
  static DUNGEON_RATE = 0;
  static RAID_CHANCE = 11;
  static RAID_RATE = 30000;
  static DUNGEON_DIFFICULTY = {
    NORMAL: "Normal",
    HARD: "Hard"
  }

  static START_TIMER = 15;

  static NORMAL_DIFF_PARTY = 4;
  static HARD_DIFF_PARTY = 3;

  static MIN_NORM_DUNGEON_FLOORS = 3;
  static MAX_NORM_DUNGEON_FLOORS = 5;

  static MIN_HARD_DUNGEON_FLOORS = 4;
  static MAX_HARD_DUNGEON_FLOORS = 6;

  static LOW_LEVEL_THRESHHOLD = 21;
  static MEDIUM_LEVEL_THRESHHOLD = 75;

  // Minimum and maximum level considered "Low Level"
  static LOW_LEVEL_MIN = 5;
  static LOW_LEVEL_MAX = 9;

  // Maximum level considered "Medium Level" (Min is LOW_LEVEL_MAX + 1) 
  static MEDIUM_LEVEL_MAX = 20;

  // The list of all active dungeons
  static dungeons = new Map();

  // The guild to which this dungeon belongs
  guildID;
  // The unique ID of thtis dungeon
  id;
  // The number of floors on this dungeon
  floors;
  // The type of this dungeon
  type;
  // The difficulty of this dungeon
  difficulty;
  // The average level of this dungeon
  level;
  // Maximum # of players a party can have
  partySize;
  // The countdown timer for the dungeon
  timer;
  // The list of parties that have joined this dungeon
  partyList;
  // The active floor objects for each party
  activeFloors;
  // The number of completed dungeons
  completed;
  // Whether the dungeon has began 
  joinLock;
  began;
  descriptor;
  roles;
  // Maximum # of parties this dungeon can have
  maxParties;

  /**
   * Construct a dungeon.
   * 
   * @param {*} guildID the guild this dungeon is active in 
   * @param {*} floors the number of floors this dungeon will have
   * @param {*} level the average level of monsters (recommended level for players)
   */
  constructor(guildID, floors, difficulty, level, type, maxparties) {
    this.maxParties = maxparties;
    this.guildID = guildID;
    this.floors = floors;
    this.difficulty = difficulty;
    this.level = level;
    this.timer = Dungeon.START_TIMER;
    this.type = type;
    this.partySize = difficulty == Dungeon.DUNGEON_DIFFICULTY.NORMAL ?
      Dungeon.NORMAL_DIFF_PARTY : Dungeon.HARD_DIFF_PARTY;
    this.partyList = [];
    this.movesList = [];
    var num = Dungeon.getRandomInt(1, 999999);
    while (Dungeon.dungeons.has(num)) {
      num = Dungeon.getRandomInt(1, 999999);
    }
    this.joinLock = false;
    this.id = num;
    this.activeFloors = [null, null, null, null, null, null];
    this.completed = 0;
    this.began = false;
    console.log("Success: Created dungeon with id " + this.id + " for server " + this.guildID);
  }

  beginDungeon(i) {
    this.activeFloors[i] = new this.Floor(this, this.difficulty, this.floors, this.type);
  }

  updateProfile(id, usergp) {
    for (let party of this.partyList) {
      for (let user of party.members) {
        if (user.id == id) { user.usergp = usergp; return; }
      }
    }
  }

  static addDungeon(dungeon) {
    console.log("Success: Adding dungeon with id " + dungeon.id + " to dungeons list");
    Dungeon.dungeons.set(dungeon.id, dungeon);
  }

  static removeDungeon(dungeon) {
    Dungeon.dungeons.delete(dungeon.id);
  }

  static getDungeon(id) {
    var dungeon = Dungeon.dungeons.get(id);
    if (dungeon == undefined) console.log("Error: Attempting to get dungeon with id " + id);
    return dungeon;
  }

  /** 
   * Returns the party object that user with id [id] is in.
   * 
   * @param {*} id the id of the user whose party we are searching for
   * @returns       the object representing user [id]'s party
   */
  getParty(id) {
    for (let i = 0; i < this.partyList.length; i++) {
      for (let j = 0; j < this.partyList[i].members.length; j++) {
        if (this.partyList[i].members[j].id == id) return this.partyList[i];
      }
    }
    return undefined;
  }

  /**
   * Returns the number of open slots in the last party in the party list
   * 
   * @returns   the number of open slots in partyList[this.partyList.length - 1]
   */
  getRemainingSpots() {
    if (this.partyList.length > 0) return this.partySize - this.partyList[this.partyList.length - 1].members.length;
    return 0;
  }

  /**
   * Return the number of parties already created
   * 
   * @returns   the number of parties in the party list
   */
  getPartyCount() {
    return this.partyList.length;
  }

  /**
   * Return the number of members in the party that user with id [id] is in. 
   * Returns -1 if the user is not in any party.
   * 
   * @param {*} id  the id of the user whose party we are searching for 
   * @returns       the number of members in user [id]'s party
   */
  getPartyMemberCount(id) {
    var party = this.getParty(id);
    if (party == undefined) return -1;
    return party.length - 1;
  }

  getPartyMemberIndex(id) {
    for (let i = 0; i < this.partyList.length; i++) {
      for (let j = 0; j < this.partyList[i].members.length; j++) {
        if (this.partyList[i].members[j].id == id) return j;
      }
    }
    return -1;
  }

  getUserInParty(id) {
    for (let i = 0; i < this.partyList.length; i++) {
      for (let j = 0; j < this.partyList[i].members.length; j++) {
        if (this.partyList[i].members[j].id == id) return this.partyList[i].members[j];
      }
    }
    return -1;
  }

  /**
   * Return the number representing the party that user with id [id] is in.
   * Returns -1 if the user is not in any party.
   * 
   * @param {*} id  the id of the user whose party we are searching for 
   * @returns       the number representing user [id]'s party
   */
  getPartyNumber(id) {
    for (let i = 0; i < this.partyList.length; i++) {
      for (let j = 0; j < this.partyList[i].members.length; j++) {
        if (this.partyList[i].members[j].id == id) return i + 1;
      }
    }
    return -1;
  }

  /**
   * Returns whether or not user with id [id] is in a party. 
   * 
   * @param {*} id  the id of the user whose party we are searching for 
   * @returns       whether the user is in a party
   */
  inParty(id) {
    for (let i = 0; i < this.partyList.length; i++) {
      for (let j = 0; j < this.partyList[i].members.length; j++) {
        if (this.partyList[i].members[j].id == id) return true;
      }
    }
    return false;
  }

  attemptJoin(id = undefined, usergp = undefined, userdp = undefined, party = undefined) {
    while (this.joinLock) { }
    this.joinLock = true;
    for (let i = 0; i < this.partyList.length; i++) {
      let dunparty = this.partyList[i];
      if (!dunparty.locked) {
        let count = party == undefined ? 1 : Object.keys(party.members).length;
        if (dunparty.members.length + count <= this.partySize) {
          return this.joinParty(i, id, usergp, userdp, party);
        }
      }
    }
    if (this.partyList.length < this.maxParties) return this.joinParty(this.partyList.length, id, usergp, userdp, party);
    this.joinLock = false;
    return -1;
  }

  joinParty(index, id, usergp, userdp, party) {
    let combat = { ap: 15, bonusap: 0, done: false, turn: true, used: [], actionqueue: [], stateffects: [] };
    let oldparty = this.partyList[index];
    if (party == undefined) {
      let user = { id: id, tag: userdp.tag, combat: combat, usergp: usergp, userdp: userdp };
      if (oldparty != undefined) {
        oldparty.members.push(user);
        this.joinLock = false;
      } else {
        let dunparty = { locked: false, members: [user] };
        this.partyList[index] = dunparty;
        this.joinLock = false;
      }
      return oldparty;
    } else {
      let dunparty;
      if (party.locked || oldparty == undefined) dunparty = { locked: party.locked, members: [] };
      else dunparty = Object.assign({}, oldparty)
      for (let name of Object.keys(party.members)) {
        let member = party.members[name];
        dunparty.members.push({ id: member.usergp.id, tag: member.tag, combat: combat, usergp: member.usergp, userdp: member.userdp });
        combat = { ap: 15, bonusap: 0, done: false, turn: true, used: [], actionqueue: [], stateffects: [] };
      }
      this.partyList[index] = dunparty;
      this.joinLock = false;
      return oldparty;
    }
  }

  /** Returns whether or not this dungeon is still joinable.
   * 
   * @returns whether the timer is still running
   */
  isJoinable() {
    return this.timer > 0;
  }

  /** Returns a random integer betweem min and max-1.
   * 
   * @param {*} min the minimum number the random generator can return
   * @param {*} max the maximum number the random generator can return
   */
  static getRandomInt(min = 0, max) {
    return Math.floor(Math.random() * max) + min;
  }

  /** Returns a Dungeon if conditions are satisfied. Randomly generates the
   * difficulty, number of floors, and average level of the dungeon. 
   * 
   * @param {*} guild the guild that the init request came from
   * @returns a Dungeon if one is created, null otherwise
   */
  static initDungeon = function (guild) {
    if (Dungeon.getRandomInt(undefined, 7) == 3) {
      // Set random difficulty, and then floors based on difficulty
      var difficulty = (Dungeon.getRandomInt(undefined, 4) == 3) ? Dungeon.DUNGEON_DIFFICULTY.HARD : Dungeon.DUNGEON_DIFFICULTY.NORMAL;
      var floors;
      if (difficulty == Dungeon.DUNGEON_DIFFICULTY.HARD) {
        floors = Dungeon.getRandomInt(Dungeon.MIN_HARD_DUNGEON_FLOORS, Dungeon.MAX_HARD_DUNGEON_FLOORS - Dungeon.MIN_HARD_DUNGEON_FLOORS);
      } else {
        floors = Dungeon.getRandomInt(Dungeon.MIN_NORM_DUNGEON_FLOORS, Dungeon.MAX_NORM_DUNGEON_FLOORS - Dungeon.MIN_NORM_DUNGEON_FLOORS);
      }

      // Set random level
      var level;
      var random = Dungeon.getRandomInt(0, 100);
      if (random < Dungeon.LOW_LEVEL_THRESHHOLD) {
        level = Dungeon.getRandomInt(Dungeon.LOW_LEVEL_MIN, Dungeon.LOW_LEVEL_MAX + 1);
      } else if (random < Dungeon.MEDIUM_LEVEL_THRESHHOLD) {
        level = Dungeon.getRandomInt(Dungeon.LOW_LEVEL_MAX + 1, Dungeon.MEDIUM_LEVEL_MAX + 1);
      } else {
        level = Dungeon.getRandomInt(Dungeon.MEDIUM_LEVEL_MAX + 1, exp.eMAX_LEVEL + 1);
      }

      // Set random dungeon type 
      var n = Dungeon.getRandomInt(0, DB.dungeons.length);
      var type = DB.dungeons[n];
      return new Dungeon(guild.id, floors, difficulty, level, type, guild.maxparties);
    }
    console.log("Error: Dungeon creation unsuccessful");
    return undefined;
  }

  Floor = class {
    // The chance for there to be an effect on a normal difficulty floor out of 10
    static NORMAL_EFFECT_CHANCE = 3;
    // The chance for there to be an effect on a hard difficulty floor out of 10
    static HARD_EFFECT_CHANCE = 5;

    static VARIATIONS = {
      ONE_TO_TWO: {
        greater: 1,
        lesser: 2,
        boss: 0
      },
      TWO_TO_ZERO: {
        greater: 2,
        lesser: 0,
        boss: 0
      },
      ZERO_TO_FOUR: {
        greater: 0,
        lesser: 4,
        boss: 0
      },
      BOSS: {
        greater: 0,
        lesser: 2,
        boss: 1
      }
    }

    // Threshhold for 1 greater, 2 lesser variation
    static ONE_TO_TWO_VAR_CHANCE = 3;
    // Threshhold for 0 greater, 4 lesser variation
    static ZERO_TO_FOUR_VAR_CHANCE = 7;

    dungeon;
    layout;
    maxfloors;
    floor;
    cleared;
    bossroom;
    difficulty;
    type;

    cleared;
    effect;
    monsters;
    monstersalive;
    turn;
    sent;

    constructor(dungeon, difficulty, maxfloors, type) {
      this.dungeon = dungeon;
      this.floor = 0;
      this.maxfloors = 1;
      this.bossroom = true;
      this.difficulty = difficulty;
      this.type = type;
      this.cleared = false;
      this.turn = 1;
      this.sent = true;
      this.initRoom();
    }

    updateMonster = function (monster, id) {
      for (let i = 0; i < this.monsters.lesser.length; i++) {
        if (this.monsters.lesser[i].id == id) this.monsters.lesser[i] = monster;
      }
      for (let i = 0; i < this.monsters.lesser.length; i++) {
        if (this.monsters.greater[i].id == id) this.monsters.greater[i] = monster;
      }
      if (this.monsters.boss[0].id == id) this.monsters.boss[0] = monster;
    }

    initRoom = function () {
      this.floor += 1;
      this.bossroom = this.floor == this.maxfloors;
      // This floor will have an effect 
      if (Dungeon.getRandomInt(undefined, 10) < this.difficulty ==
        Dungeon.DUNGEON_DIFFICULTY.NORMAL ? this.dungeon.Floor.NORMAL_EFFECT_CHANCE :
        this.dungeon.Floor.HARD_EFFECT_CHANCE) {
        if (this.difficulty == Dungeon.DUNGEON_DIFFICULTY.NORMAL) {
          this.effect = DB.fe_normal[Dungeon.getRandomInt(undefined, DB.fe_normal.length)];
        } else this.effect = DB.fe_hard[Dungeon.getRandomInt(undefined, DB.fe_hard.length)];
      } else this.effect = null;

      // Setting monster variation
      var variation = null;
      const n = Dungeon.getRandomInt(undefined, 11);
      if (this.bossroom) variation = this.dungeon.Floor.VARIATIONS.BOSS;
      else if (n <= this.dungeon.Floor.ONE_TO_TWO_VAR_CHANCE) variation = this.dungeon.Floor.VARIATIONS.ONE_TO_TWO;
      else if (n <= this.dungeon.Floor.ZERO_TO_FOUR_VAR_CHANCE) variation = this.dungeon.Floor.VARIATIONS.ZERO_TO_FOUR;
      else variation = this.dungeon.Floor.VARIATIONS.TWO_TO_ZERO;
      this.layout = variation;

      // Creating monsters and adding to list
      var spawned = 0;
      var unique = null;
      this.monsters = [];
      for (let i = 0; i < variation.lesser; i++) {
        if (i == 1 && this.bossroom) {
          this.monsters.push(new Monster(spawned, true, true, this.type, unique));
          spawned++;
        }
        const monster = new Monster(spawned, true, false, this.type, unique);
        switch (unique) {
          case null:
            if (monster.name == 'goblin') unique = Monster.UNIQUE.goblin_group;
            break;
        }
        this.monsters.push(monster);
        spawned++;
      }
      for (let i = 0; i < variation.greater; i++) {
        this.monsters.push(new Monster(spawned, false, false, this.type))
        spawned++;
      }
      this.monstersalive = this.monsters.length;
    }
  }
}

module.exports = Dungeon;