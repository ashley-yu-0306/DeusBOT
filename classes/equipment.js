const DB = require('../utils/db.js');
const Random = require('./random.js');
const Item = require('./item.js');

class Equipment {
  static KEY = { 'dungeon': 'd', 'merchant': 'm', 'tutorial': 't' };

  /**  Scales for armor and damage based on variant and category */
  // Armor defense scale (casting variant)
  static A_CAST_DEF_SCALE = 0.9;
  // Sub-armor defense scall
  static SB_DEF_SCALE = 0.6

  // Armor damage scale (all variants)
  static A_DMG_SCALE = 0.9;
  static SB_DMG_SCALE = 0.6;

  // Weapon damage scale (guarding variant)
  static W_GUARD_DMG_SCALE = 0.7;

  // Weapon armor scale (guarding and non-guarding variant)
  static W_DEF_GUARD_SCALE = 0.8;
  static W_DEF_NONGUARD_SCALE = 1.1;

  static PIECE_NAME = ['helmet', 'chest', 'pants', 'boots', 'weapon', 'ring'];
  static PIECE_SLOT = ['head', 'body', 'legs', 'feet', 'weapon', 'ring'];
  static SUB_ARMOR = ['Helmet', 'Boots'];

  static G_CLASSES = ['warrior', 'holy knight', 'dark knightt'];
  static A_CLASSES = ['thief', 'reaper', 'ninja'];
  static M_CLASSES = ['mage', 'sorcerer', 'priest'];

  static VARIANTS = ['guarding', 'striking', 'casting'];
  static WEAPON_VARIANTS = ['blade', 'daggers', 'staff'];

  static classCanEquip(name, user) {
    const job = user.profile.job.toLowerCase();
    if (name.includes(Equipment.VARIANTS[0])) {
      if (Equipment.G_CLASSES.includes(job)) return true;
      else return false;
    }
    if (name.includes(Equipment.VARIANTS[1])) {
      if (Equipment.A_CLASSES.includes(job)) return true;
      else return false;
    }
    if (name.includes(Equipment.VARIANTS[2])) {
      if (Equipment.M_CLASSES.includes(job)) return true;
      else return false;
    }
  }

  static makeEquip(set, item, variant, slot, armor, physdmg, magicdmg) {
    var equipment = {
      name: set.descriptor + ' ' + item + ' of ' + variant,
      armor: armor,
      physdmg: physdmg,
      magicdmg: magicdmg,
      slot: slot,
      levelreq: set.level
    };
    return Item.addItemFields(equipment);
  }

  static prepStats(set, item, vi, slot) {
    var armor = 0;
    var dmg = 0;
    var variant = this.VARIANTS[vi];
    if (item != 'weapon') {
      dmg = this.A_DMG_SCALE * set.base;
      if (variant == 'casting') armor = set.base * this.A_CAST_DEF_SCALE;
      else armor = set.base;
      if (this.SUB_ARMOR.includes(item)) { armor *= this.SB_DEF_SCALE; dmg *= this.SB_DMG_SCALE; }
    } else {
      if (variant == 'guarding') { dmg = this.W_GUARD_DMG_SCALE * set.base; armor = this.W_DEF_GUARD_SCALE * set.base; }
      else { dmg = set.base; armor = this.W_DEF_NONGUARD_SCALE * set.base; }
      item = this.WEAPON_VARIANTS[vi];
    }
    armor = Math.ceil(armor);
    dmg = Math.ceil(dmg);
    var physdmg = 0;
    var magicdmg = 0;
    if (variant == 'casting') magicdmg = dmg;
    else physdmg = dmg;
    return this.makeEquip(set, item, variant, slot, armor, physdmg, magicdmg);
  }

  static randomEquipFromSet(type, id, num) {
    var set = DB.equipment.get((Equipment.KEY[type] + id));
    var equipment = [];
    for (let i = 0; i < num; i++) {
      var n = Random.getRandomInt(0, this.PIECE_NAME.length - 1);
      var vi = Random.getRandomInt(0, this.VARIANTS.length);
      equipment.push(this.prepStats(set, this.PIECE_NAME[n], vi, this.PIECE_SLOT[n]));
    }
    return equipment;
  }
}

module.exports = Equipment;
