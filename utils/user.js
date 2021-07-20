const DB = require('../utils/db.js');
const REQUESTS = {
  REQUIRE: 1, // Require the user to have a character. Send NO_CHAR_ERROR if user does not.
  OPTIONAL: 2, // Does not matter if user has a character. Send nothing. 
  NONREQUIRE: 3 // Require the user to not have a character. Send HAS_CHAR_ERROR if uesr does.
}
exports.eREQUESTS = REQUESTS;
const BUSY_REASONS = {}

/** Get all information about the user from the database, including ID, class, EXP, and level. 
 * 
 * @param message the message that triggered this request 
 * @param start whether or not this message was triggered by '{prefix}start' command
 * @return a user object or null, depending on whether a user was found 
*/
exports.userData = async (message, type, other = undefined) => {
  var query = await DB.getEntryByID(other == undefined ? message.author.id : other, DB.eTABLES.user);
  if (query.Items.length == 0) {
    if (type == REQUESTS.REQUIRE) {
      console.log("Error: User with id " + message.author.id + " does not exist.");
    }
    return null;
  } else {
    if (type == REQUESTS.NONREQUIRE) { console.log("Error: User already exists."); }
    var user = { id: '', lastmsg: '', inventory: '', equipped: '', profile: '' };
    query.Items.forEach(function (item) {
      user = {
        id: item.id,
        busy: item.busy,
        partyid: item.partyid,
        lastmsg: item.lastmsg,
        inventory: item.inventory,
        equipped: item.equipped,
        profile: item.profile,
      }
    });
    return user;
  }
}

const updateItem = function (item, inventory) {
  let entry = inventory[item.name];
  if (entry != undefined) {
    entry.quantity += item.quantity;
    if (entry.quantity <= 0) {
      delete inventory[item.name];
    }
  } else inventory[item.name] = item;
}

exports.updateEquipped = function (inventory, equipped, profile, slot, equipment = undefined) {
  if (equipped[slot] != null) {
    let item = equipped[slot];
    profile.physdmg -= item.physdmg;
    profile.magicdmg -= item.magicdmg;
    profile.armor -= item.armor;
    updateItem(item, inventory);
    equipped[slot] = null;
  }
  if (equipment != undefined) {
    let inc = Object.assign({}, equipment);
    inc.quantity = 1;
    equipped[slot] = inc;
    profile.physdmg += equipment.physdmg;
    profile.magicdmg += equipment.magicdmg;
    profile.armor += equipment.armor;
    let dec = Object.assign({}, equipment);
    dec.quantity = -1;
    updateItem(dec, inventory);
  }
}

exports.updateItem = updateItem;