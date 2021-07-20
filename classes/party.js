const Random = require("./random");

class Party {
  static MAX_PARTY = 4;
  static parties = new Map();

  party_id;
  leader_id;
  members;

  constructor(leader, invitee, leader_tag, invitee_tag) {
    this.party_id = Random.getRandomInt(1, 999999);
    while (Party.parties.has(this.party_id)) {
      this.party_id = Dungeon.getRandomInt(1, 999999);
    }
    this.leader_id = leader.id;
    this.members = [];
    let leader_obj = { tag: leader_tag, usergp: leader };
    let invitee_obj = { tag: invitee_tag, usergp: invitee };
    this.members[this.leader_id] = leader_obj;
    this.members[invitee.id] = invitee_obj;
  }

  isLeader(id) { return id == this.leader_id; }

  leaveParty(invitee) { this.members.delete(invitee.id); }

  joinParty(invitee) {
    if (this.members.keys().length == Party.MAX_PARTY) return false;
    this.members.set(invitee.id, invitee);
    return true;
  }
}

module.exports = Party;