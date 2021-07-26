const Random = require("./random");

class Party {
  static MAX_PARTY = 4;
  static parties = new Map();

  party_id;
  leader_id;
  members;
  locked;

  constructor(leader, invitee, leader_dp, invitee_dp) {
    this.party_id = Random.getRandomInt(1, 999999);
    while (Party.parties.has(this.party_id)) {
      this.party_id = Dungeon.getRandomInt(1, 999999);
    }
    this.leader_id = leader.id;
    this.members = {};
    leader.data.partyid = this.party_id;
    invitee.data.partyid = this.party_id;
    let leader_obj = { tag: leader_dp.tag, usergp: leader, userdp: leader_dp };
    let invitee_obj = { tag: invitee_dp.tag, usergp: invitee, userdp: invitee_dp };
    this.members[this.leader_id] = leader_obj;
    this.members[invitee.id] = invitee_obj;
    this.locked = false;
  }

  static updateUserGP(user) {
    let party = Party.parties.get(user.data.partyid);
    party[user.id] = user;
  }

  disband() { Party.parties.delete(this.party_id); }

  inParty(id) {
    for (let key of Object.keys(this.members)) {
      let member = this.members[key];
      if (member.usergp.id == id) return true;
    }
    return false;
  }

  remove(id) {
    for (let key of Object.keys(this.members)) {
      let member = this.members[key];
      if (member.usergp.id == id) { let kicked = Object.assign({}, member); delete this.members[key]; console.log(kicked); return kicked; }
    }
  }

  isLeader(id) { return id == this.leader_id; }

  leaveParty(invitee) { this.members.delete(invitee.id); }

  joinParty(invitee, invitee_dp) {
    if (Object.keys(this.members).length == Party.MAX_PARTY) return false;
    let invitee_obj = { tag: invitee_dp.tag, usergp: invitee, userdp: invitee_dp };
    this.members[invitee.id] = invitee_obj;
    return true;
  }
}

module.exports = Party;