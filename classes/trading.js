const updateUTIL = require('../utils/update.js');
const userUTIL = require('../utils/user.js');

class Trading {

  static trades = new Map();

  user1;
  user2;
  bot_msg;

  constructor(invitor_id, invitor_tag, invitee_id, invitee_tag) {
    this.user1 = {};
    this.user2 = {};
    this.user1.id = invitor_id;
    this.user1.tag = invitor_tag;
    this.user1.gold_offer = 0;
    this.user1.item_offers = [];
    this.user1.confirm = false;
    this.user2.id = invitee_id;
    this.user2.tag = invitee_tag;
    this.user2.gold_offer = 0;
    this.user2.item_offers = [];
    this.user2.confirm = false;
  }

  setMsg = function (msg) { this.bot_msg = msg; }

  getUser = function (id) { return this.user1.id == id ? this.user1 : this.user2; }

  removeTrade(trade_id) {
    Trading.trades.delete(trade_id);
  }

  finalizeTrade(gp1, gp2) {
    let user1_gp, user2_gp;
    if (gp1.id == this.user1.id) { user1_gp = gp1; user2_gp = gp2; }
    else { user1_gp = gp2; user2_gp = gp1; }

    let curr = user1_gp, target = user2_gp, curr_trades = this.user1;
    for (let i = 0; i < 2; i++) {
      for (let key of Object.keys(curr_trades.item_offers)) {
        let item = curr_trades.item_offers[key];
        userUTIL.updateItem(Object.assign({}, item), target.inventory);
        item.quantity *= -1;
        userUTIL.updateItem(item, curr.inventory);
      }
      curr.profile.gold -= curr_trades.gold_offer;
      target.profile.gold += curr_trades.gold_offer;
      curr = user2_gp;
      target = user1_gp;
      curr_trades = this.user2;
    }
    user1_gp.data.busy = '';
    user2_gp.data.busy = '';
    updateUTIL.updateUser(user1_gp.id, user1_gp.lastmsg, user1_gp.data, user1_gp.inventory,
      user1_gp.equipped, user1_gp.profile, user1_gp.profile.hp);
    updateUTIL.updateUser(user2_gp.id, user2_gp.lastmsg, user2_gp.data, user2_gp.inventory,
      user2_gp.equipped, user2_gp.profile, user2_gp.profile.hp);
  }

  confirmTrade(id) {
    let user = this.getUser(id);
    user.confirm = true;
    if (this.user1.confirm && this.user2.confirm) {
      return true;
    }
    return false;
  }

  resetConfirms() {
    this.user1.confirm = false;
    this.user2.confirm = false;
  }

  updateGold(id, amount, reset = false) {
    this.resetConfirms();
    let user = this.getUser(id);
    if (reset) user.gold_offer = 0;
    else user.gold_offer += amount;
  }

  updateItem(id, offer, remove = false, reset = false) {
    this.resetConfirms();
    let user = this.getUser(id);
    if (reset) user.item_offers = [];
    else if (remove) delete user.item_offers[offer.name];
    else {
      let item = user.item_offers[offer.name];
      if (item != undefined) offer.quantity += item.quantity;
      user.item_offers[offer.name] = offer;
    }
  }
}

module.exports = Trading;