const DB = require('../utils/db.js');

class Item {
  static categories = {
    weapon: 'weapons',
    equipment: 'equipment',
    item: 'items',
    coffer: 'coffers',
    armor: 'armor',
    ring: 'rings'
  };

  static makeItem = function (id, quantity) {
    var item = Object.assign({}, DB.items.get(id));
    var cats = [item.category1];
    if (item.category2 != undefined) cats.push(item.category2);
    item.quantity = quantity;
    item.category = cats;
    delete item.category1;
    delete item.category2;
    return item;
  }

  static addItemFields = function (value) {
    var category = [];
    if (value.slot != undefined) {
      if (value.slot == 'weapon') category.push(this.categories.weapon);
      else if (value.slot == 'ring') category.push(this.categories.ring);
      else category.push(this.categories.armor);
      category.push(this.categories.equipment);
    }
    value.category = category;
    value.quantity = 1;
    return value;
  }
}

module.exports = Item;