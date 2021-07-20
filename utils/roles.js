const updateUTIL = require('./update.js');
const Discord = require('discord.js');

exports.setPermissions = function (guild, channel, server, n) {
  const everyone = guild.roles.cache.find(r => r.name == '@everyone');
  channel.overwritePermissions([
    {
      id: server.roles[n - 1],
      allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']
    },
    {
      id: everyone,
      allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
      deny: ['SEND_MESSAGES']
    }
  ])
}

/**
 * Assign the role [role] for each user in [users].
 * 
 * @param {*} users   the users to assign the role to
 * @param {*} role    the role to assign the users
 */
exports.assignRole = function (users, role) {
  for (let user of users) {
    user.roles.add(role);
  }
  console.log("Success: Assigned the role [" + role.name + "] to " + users.length + " users.");
}

/**
 * Removes the role [role] from each user in [users].
 * 
 * @param {*} users   the users to remove the role from
 * @param {*} role    the role to remove
 */
exports.removeRole = function (users, role) {
  for (let user of users) {
    user.roles.remove(role);
  }
}

exports.initRoles = async (guild, server) => {
  var roles = [];
  for (let i = 1; i <= 6; i++) {
    guild.roles.create({
      data: {
        name: 'Party ' + i,
        permissions: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
        mentionable: true
      },
      reason: "This role ensures that only users belonging to party " + i +
        " can send messages in the party's dungeon channel. This role is automatically " +
        " assigned. Feel free to change its name and color, but please do not remove it."
    }).then(function (role) {
      roles.push(role.id);
      if (roles.length == 6) {
        updateUTIL.updateServer(guild.id, undefined, undefined, undefined, undefined,
          undefined, undefined, undefined, undefined, roles, server);
      }
    })
  }
}

/**
 * Returns an array containing two arrays. The first contaains the party numbers 
 * of all missing roles for a server. The second contains the role objects for 
 * non-missing roles.
 * 
 * Missing roles are roles that are found in the database containing server 
 * information but not actually found within the server itself.
 * 
 * @param {*} guild   the Discord server
 * @param {*} server  information on the server in the database
 * @returns           an array containing missing roles
 */
exports.checkRoles = function (guild, server) {
  var arr = [[], []];
  for (let i = 0; i < server.roles.length; i++) {
    if (!guild.roles.cache.has(server.roles[i])) { arr[0].push(i); arr[1].push(null); }
    else { arr[1].push(guild.roles.cache.get(server.roles[i])); }
  }
  return arr;
}

exports.replaceRole = async (guild, server, n) => {
  console.log("Log: Replacing role for party " + (n + 1));
  guild.roles.create({
    data: {
      name: 'Party ' + (i + 1),
      permissions: new Discord.Permissions(67584),
      mentionable: true
    },
    reason: "This role ensures that only users belonging to party " + i +
      " can send messages in the party's dungeon channel. This role is automatically " +
      " assigned. Feel free to change its name and color, but please do not remove it."
  }).then(function (role) {
    server.roles[n] = role;
    updateUTIL.updateServer(guild.id, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined, server.roles, server);
    return role.Promise();
  })
}
