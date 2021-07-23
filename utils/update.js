const DB = require('./db.js');
const Party = require('../classes/party.js');

exports.updateUser = async (id, lastmsg, busy, partyid, inventory, equipped, profile, hp = undefined) => {
  if (hp == undefined) {
    let job = profile.job.toLowerCase();
    var hpbase = parseInt(DB.p_stats['HPbase'][job]);
    var hpgs = parseInt(DB.p_stats['HPgs'][job]);
    profile.hp = Math.ceil(hpbase + (hpgs * (profile.level - 1) * (0.7025 + (0.0175 * (profile.level - 1)))));
    profile.maxhp = profile.hp;
    profile.physdmg = parseInt(DB.p_stats['PHYSbase'][job]);
    profile.magicdmg = parseInt(DB.p_stats['MAGICbase'][job]);
    profile.armor = parseInt(DB.p_stats['ARMORbase'][job]);
  }
  const user = {
    id: id,
    lastmsg: lastmsg,
    partyid: partyid,
    busy: busy,
    inventory: inventory,
    equipped: equipped,
    profile: profile
  }
  if (user.partyid != -1) Party.updateUserGP(user);
  await DB.eUpdateEntry(DB.eTABLES.user, user);
}

exports.updateServer = async (id, lastdungeon = undefined, lastraid = undefined,
  lastdungeoncheck = undefined, lastraidcheck = undefined, activedungeon = undefined,
  activeraid = undefined, pchannels = undefined, maxparties = undefined, roles = undefined,
  server) => {
  const guild = {
    id: id,
    lastdungeon: lastdungeon == undefined ? server.lastdungeon : lastdungeon,
    lastraid: lastraid == undefined ? server.lastraid : lastraid,
    lastdungeoncheck: lastdungeoncheck == undefined ? server.lastdungeoncheck : lastdungeoncheck,
    lastraidcheck: lastraidcheck == undefined ? server.lastraidcheck : lastraidcheck,
    activedungeon: activedungeon == undefined ? server.activedungeon : activedungeon,
    activeraid: activeraid == undefined ? server.activeraid : activeraid,
    pchannels: pchannels == undefined ? server.pchannels : pchannels,
    roles: roles == undefined ? server.roles : roles,
    maxparties: maxparties == undefined ? server.maxparties : maxparties
  }
  DB.eUpdateEntry(DB.eTABLES.guild, guild).then(function () {
    console.log("Success: Updated server information with the following modified properties:");
    if (lastdungeon != undefined) console.log("\tlastdungeon: " + lastdungeon);
    if (lastraid != undefined) console.log("\tlastraid: " + lastraid);
    if (lastdungeoncheck != undefined) console.log("\tlastdungeoncheck: " + lastdungeoncheck);
    if (lastraidcheck != undefined) console.log("\tlastraidcheck: " + lastraidcheck);
    if (activedungeon != undefined) console.log("\tactivedungeon: " + activedungeon);
    if (activeraid != undefined) console.log("\tactiveraid: " + activeraid);
    if (pchannels != undefined) console.log("\tp1channel: " + pchannels);
    if (roles != undefined) console.log("\troles: " + roles);
    if (maxparties != undefined) console.log("\tmaxparties: " + maxparties);
  })
}