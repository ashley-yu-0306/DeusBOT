const DB = require('./db.js');

exports.updateUser = async (id, lastmsg, busy, partyid, inventory, equipped, profile, hp = undefined) => {
  if (hp == undefined) {
    var index = DB.STATS_ORDER.indexOf(profile.job.toLowerCase());
    var hpbase = DB.stats.get('HPbase')[index];
    var hpgs = DB.stats.get('HPgs')[index];
    profile.hp = Math.ceil(hpbase + (hpgs * (profile.level - 1) * (0.7025 + (0.0175 * (profile.level - 1)))));
    profile.maxhp = profile.hp;
    profile.physdmg = DB.stats.get('PHYSbase')[index];
    profile.magicdmg = DB.stats.get('MAGICbase')[index];
    profile.armor = DB.stats.get('ARMORbase')[index];
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