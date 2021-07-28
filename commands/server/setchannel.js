const serverUTIL = require('../../utils/server.js');
const Format = require('../../utils/format.js');
const updateUTIL = require('../../utils/update.js');
const rolesUTIL = require('../../utils/roles.js');
const messages = require('../../data/messages.js').set_channel;
const syntax = require('../../data/messages.js').syntax;

module.exports = {
  name: 'setchannel',
  aliases: undefined,
  description: 'Set the channel for dungeons 1-6.',
  execute(message, args) {
    if (args.length < 3) { Format.sendMessage(message, messages.syntax); return; }
    if (isNaN(args[0])) { Format.sendMessage(message, messages.NaN.format(args[0]), syntax.set_channel); return; }
    const n = parseInt(args[0]);
    if (n < 1 || n > 6) { Format.sendMessage(message, messages.OOB.format(n), syntax.set_channel); return; }
    const id = args[1].substring(2, args[1].length - 1);
    const channel = args[2].cache.get(id);
    if (channel == undefined) { Format.sendMessage(message, messages.no_such_channel.format(id), syntax.set_channel); return; }
    if (channel.type != 'text') { Format.sendMessage(message, messages.invalid_channel_type.format(channel.name, channel.type)); return; }
    serverUTIL.serverData(message).then(function (server) {
      var arr = [];
      for (let i = 0; i < n - 1; i++) {
        if (server.pchannels[i] == null) arr.push(i + 1);
      }
      if (arr.length != 0) { Format.sendMessage(message, messages.prev_unset); return; }
      if (server.pchannels.includes(id)) {
        Format.sendMessage(message, messages.dup_warning.format(channel.name, server.pchannels.indexOf(id) + 1)); return;
      }
      const original = server.pchannels[n - 1];
      server.pchannels[n - 1] = id;
      updateUTIL.updateServer(message.guild.id, undefined, undefined, undefined,
        undefined, undefined, undefined, server.pchannels,
        original == null ? server.maxparties + 1 : undefined, undefined, server).then(function () {
          rolesUTIL.setPermissions(message.guild, channel, server, n);
          Format.sendMessage(message, messages.set_success.format(channel.name, n));
        })
    })
  }
}