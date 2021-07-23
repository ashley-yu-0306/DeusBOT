const serverUTIL = require('../../utils/server.js');
const Format = require('../../utils/format.js');
const updateUTIL = require('../../utils/update.js');
const rolesUTIL = require('../../utils/roles.js');

module.exports = {
  name: 'setchannel',
  aliases: undefined,
  description: 'Set the channel for dungeons 1-6.',
  execute(message, args) {
    if (args.length < 3) { Format.sendSyntaxMessage(message, 'setchannel'); return; }
    const n = parseInt(args[0]);
    if (n == NaN) { Format.sendServerMessage(message, 'NaN'); return; }
    if (n < 1 || n > 6) { Format.sendServerMessage(message, 'OOB'); return; }
    const id = args[1].substring(2, args[1].length - 1);
    const channel = args[2].cache.get(id);
    if (channel == undefined) { Format.sendServerMessage(message, 'nochannel'); return; }
    if (channel.type != 'text') { Format.sendServerMessage(message, 'invalidchannel', channel); return; }
    serverUTIL.serverData(message).then(function (server) {
      var arr = [];
      for (let i = 0; i < n - 1; i++) {
        if (server.pchannels[i] == null) arr.push(i + 1);
      }
      if (arr.length != 0) { Format.sendServerMessage(message, 'prevmissing', arr); return; }
      if (server.pchannels.includes(id)) {
        Format.sendServerMessage(message, 'dupwarning', [channel.name, server.pchannels.indexOf(id) + 1]); return;
      }
      const original = server.pchannels[n - 1];
      server.pchannels[n - 1] = id;
      updateUTIL.updateServer(message.guild.id, undefined, undefined, undefined,
        undefined, undefined, undefined, server.pchannels,
        original == null ? server.maxparties + 1 : undefined, undefined, server).then(function () {
          rolesUTIL.setPermissions(message.guild, channel, server, n);
          Format.sendServerMessage(message, 'setsuccess', [channel, n]);
        })
    })
  }
}