const Discord = require('discord.js');
const emoji = require('../data/emojis.js');
const messages = require('../data/messages.js');
const DB = require('./db.js');
require('dotenv').config();
const updateUTIL = require('./update.js');
const userUTIL = require('./user.js');
const rolesUTIL = require('./roles.js');
const Trading = require('../classes/trading.js');
const Party = require('../classes/party.js');
const loot = require('../data/loot.js');
const { MessageActionRow, MessageButton } = require('discord-buttons');

/**
 * Formats (if necessary) and sends any messages or message embed for the bot.
 */
class Format {
  static PREPOSITION = ["of"];
  static CONFIRMATION = ["Confirm", "Cancel"]

  static makeEmbed = function () {
    return new Discord.MessageEmbed().setColor('#B93418');
  }

  static makeEmoji = function (category, name) {
    if (category == 'default') return emoji.default[name];
    return "<:" + name + ":" + emoji.general[name] + ">";
  }

  /**
   * Capitalize the first character of every string in [array] and return
   * the resulting string.
   * 
   * @param {*} array   an array of strings to capitalize the first character of
   * @returns           a string containing all of [array] strings with the first
   *                    character capitalized
   */
  static capitalizeFirsts = function (array) {
    var string = "";
    const args = array.split(/ +/);
    for (let arg of args) {
      if (!this.PREPOSITION.includes(arg)) string = string + arg.charAt(0).toUpperCase() + arg.slice(1) + " ";
      else string = string + arg + " ";
    }
    return string.slice(0, string.length - 1);
  }

  static sendSyntaxMessage = function (message, type) {
    var synmsg = messages.syntaxmessage;
    var string = synmsg.syntax;
    switch (type) {
      case 'setchannel':
        string += synmsg.setchannel; break;
    }
    message.channel.send(string);
  }

  static sendServerMessage = function (message, type, args = undefined) {
    var sermsg = messages.servermessage;
    var string;
    switch (type) {
      case 'NaN':
        string = sermsg.NaN; break;
      case 'OOB':
        string = sermsg.OOB; break;
      case 'nochannel':
        string = sermsg.nochannel; break;
      case 'invalidchannel':
        string = args.name + sermsg.invalidchannel1 + args.type + sermsg.invalidchannel2; break;
      case 'prevmissing':
        string = sermsg.prevmissing;
        for (let arg of args) {
          string += arg + ", "
        }
        string = string.substring(0, string.length - 2);
        break;
      case 'setsuccess':
        string = sermsg.setsuccess1 + args[0].name + sermsg.setsuccess2 + args[1] + sermsg.setsuccess3; break;
      case 'dupwarning':
        string = args[0] + sermsg.dupwarning1 + args[1] + sermsg.dupwarning2; break;
      default:
        string = ""; break;
    }
    message.channel.send(string);
  }

  static sendPartyMessage = function (message, type, args = undefined) {
    console.log("88")
    var pmsg = messages.partymessage;
    var string;
    switch (type) {
      case 'switchlock':
        if (args[0]) string = pmsg.lock;
        else string = pmsg.unlock;
        break;
      case 'usernotinparty':
        string = pmsg.usernotinparty; break;
      case 'appointsuccess':
        string = pmsg.appointsuccess1 + args[0] + pmsg.appointsuccess2; break;
      case 'kicksuccess':
        string = pmsg.kicksuccess1 + args[0] + pmsg.kicksuccess2; break;
      case 'kickleader': string = pmsg.kickleader; break;
      case 'hasleft': string = args[0] + pmsg.hasleft; args[1].send(string); break;
      case 'disband_channel': string = pmsg.disband; break;
      case 'disband_dm': string = pmsg.disband; args[0].send(string); break;
      case 'disband_success': string = pmsg.disband_success; break;
      case 'leaderonly': string = pmsg.leaderonly; break;
      case 'newleader': string = args[0] + pmsg.newleader; args[1].send(string); return;
      case 'selfleader': string = pmsg.selfleader; args[0].send(string); return;
    }
    message.channel.send(string);
  }

  static sendDungeonMessage = function (message, type, args = undefined) {
    var dunmsg = messages.dungeonmessage;
    var string;
    switch (type) {
      case 'joinerror':
        string = dunmsg.joinerror; break;
      case 'doneerror':
        string = dunmsg.doneerror; break;
      case 'expireerror':
        string = dunmsg.expireerror; break;
      case 'inerror':
        string = dunmsg.inerror; break;
      case 'insuffitem':
        string = dunmsg.insuffitem; break;
      case 'nopartyerror':
        string = dunmsg.nopartyerror; break;
      case 'insuffap':
        string = dunmsg.insuffap; break;
      case 'itemindexerror':
        string = dunmsg.itemindexerror; break;
      case 'turncomplete':
        string = dunmsg.turncomplete; break;
      case 'abilindexerror':
        string = dunmsg.abilindexerror; break;
      case 'targetnumber':
        string = dunmsg.targetnumber; break;
      case 'invmonsternumber':
        string = dunmsg.invmonsternumber; break;
      case 'deadmonster':
        string = dunmsg.deadmonster; break;
      case 'nosuchaction':
        string = dunmsg.nosuchaction1;
        var actionqueue = args[0];
        for (let i = 0; i < actionqueue.length; i++) {
          if (i == actionqueue.length - 1) string += actionqueue[i];
          else string += actionqueue[i] + ", "
        }
        string += dunmsg.nosuchaction2;
        break;
      case 'undosuccess':
        string = dunmsg.undosuccess1 + args[0] + dunmsg.undosuccess2;
        var actionqueue = args[1];
        for (let i = 0; i < actionqueue.length; i++) {
          if (i == actionqueue.length - 1) string += actionqueue[i];
          else string += actionqueue[i] + ", "
        }
        string += dunmsg.undosuccess3 + args[2] + dunmsg.undosuccess4 + args[4] + " " + args[3]
          + (args[4] > 1 ? "s" : "") + dunmsg.undosuccess5;
        break;
      case 'emptyactionqueue':
        string = dunmsg.emptyactionqueue; break;
      case 'didaction':
        var actionqueue = args[0];
        string = dunmsg.didaction1;
        for (let i = 0; i < actionqueue.length; i++) {
          if (i == actionqueue.length - 1) string += actionqueue[i];
          else string += actionqueue[i] + ", "
        }
        string += dunmsg.didaction2 + args[1] + dunmsg.didaction3 + args[2] + " " + args[3] + (args[2] == 1 ? "" : "s") + dunmsg.didaction4;
        break;
      case 'didability':
        var actionqueue = args[0];
        string = dunmsg.didaction1;
        for (let i = 0; i < actionqueue.length; i++) {
          if (i == actionqueue.length - 1) string += actionqueue[i];
          else string += actionqueue[i] + ", "
        }
        string += dunmsg.didaction2 + args[1] + dunmsg.didability3;
        break;
      case 'channelerror':
        string = dunmsg.channelerror1 + args + dunmsg.channelerror2; break;
      case 'joinsuccess':
        var dungeon = args[0];
        var usergp = args[1];
        var num = dungeon.getPartyMemberCount(usergp.id);
        string = dunmsg.joinsuccess1 + dungeon.getPartyNumber(usergp.id) + dunmsg.joinsuccess2 + dungeon.getPartyMemberCount(usergp.id);
        num == 1 ? string += dunmsg.joinsuccess3single : string += dunmsg.joinsuccess3plural;
        message.author.send(string);
        return;
      case 'partyjoinsuccess':
        var dungeon = args[0], party = args[1];

        return;
      case 'partyjoinnotif':
        var party = args[0], userdp = args[1], open = args[2];
        for (let i = 0; i < Object.keys(party.members).length; i++) {
          let user = party.members[i];
          str += (i == Object.keys(party.members).length - 1 ? "and " : "") + user.tag +
            "(Lv. " + user.usergp.profile.level + ")" + (i == Object.keys(party.members).length - 1 ? " " : ", ");
        }
        str += dunmsg.joinnotif1;
        if (open == 0) { string += dunmsg.joinnotiffull; }
        else if (open == 1) { string += dunmsg.joinnotifopensingle; }
        userdp.send(string);
        return;
      case 'joinnotif':
        var usergp = args[0], userdp = args[1], open = args[2];
        string = message.author.tag + " (Lv. " + usergp.profile.level + ")" + dunmsg.joinnotif1;
        if (open == 0) { string += dunmsg.joinnotiffull; }
        else if (open == 1) { string += dunmsg.joinnotifopensingle; }
        else { string += dunmsg.joinnotifopen1plural + open + dunmsg.joinnotifopen2plural; }
        userdp.send(string);
        return;
      case 'diddone':
        var actionqueue = args[0], notdone = args[1];
        string = dunmsg.diddone1;
        for (let i = 0; i < actionqueue.length; i++) {
          if (i == actionqueue.length - 1) string += actionqueue[i];
          else string += actionqueue[i] + ", "
        }
        string += dunmsg.diddone2;
        if (notdone.length > 0) {
          string += dunmsg.diddonewait;
          for (let i = 0; i < notdone.length; i++) {
            if (i == notdone.length - 1) string += notdone[i] + ".";
            else string += notdone[i] + ", "
          }
        }
        break;
      case 'maxparties':
        var userdp = args[0], max = args[1];
        string = messages.dungeonmessage.maxreached;
        if (max < 6) string += messages.dungeonmessage.notmaxcapacity1 + max + messages.dungeonmessage.notmaxcapacity2;
        return;
      case 'autostart':
        for (let i = 0; i < args[2]; i++) {
          string = dunmsg.divider;
          string += "<@&" + args[1][i].id + ">";
          string += dunmsg.autostart;
          string += dunmsg.divider;
          const channel = message.guild.channels.cache.get(args[0][i]);
          channel.send(string);
        }
        return;
      case 'soonstart':
        for (let i = 0; i < args[1]; i++) {
          string = dunmsg.soonstart;
          const channel = message.guild.channels.cache.get(args[0][i]);
          channel.send(string);
        }
        return;
      default:
        string = ""; break;
    }
    message.channel.send(string);
  }

  static sendAdvanceMessage = function (message, type) {
    var string;
    switch (type) {
      case 'insufflevel':
        string = messages.advancemessage.insufflevel; break;
      case 'success':
        string = messages.advancemessage.success; break;
    }
    message.channel.send(string);
  }

  static sendUserMessage = function (message, type, args = undefined) {
    var string;
    var usermsg = messages.usermessage;
    switch (type) {
      case 'finderror':
        string = usermsg.finderror; break;
      case 'notinparty':
        string = usermsg.notinparty; break;
      case 'inviteself':
        string = usermsg.inviteself; break;
      case 'someoneinerror':
        string = usermsg.someoneinerror; break;
      case 'leaderonlyinvite':
        string = usermsg.leaderonlyinvite; break;
      case 'notintrade':
        string = usermsg.notintrade; break;
      case 'tradecomplete':
        string = usermsg.tradecomplete; break;
      case 'notenoughitems':
        string = usermsg.notenoughitems; break;
      case 'notenoughgoldtrade':
        string = usermsg.notenoughgoldtrade; break;
      case 'mentionuser':
        string = usermsg.mentionuser; break;
      case 'canttradenoitem':
        string = usermsg.canttradenoitem; break;
      case 'tradeself':
        string = usermsg.tradeself; break;
      case 'busydungeon':
        string = usermsg.busydungeon; break;
      case 'targetbusydungeon':
        string = usermsg.targetbusydungeon; break;
      case 'nickremove':
        string = usermsg.nickremove; break;
      case 'cancel':
        string = usermsg.cancel; break;
      case 'haserror':
        string = usermsg.haserror; break;
      case 'charsonly':
        string = usermsg.charsonly; break;
      case 'buysuccess':
        string = usermsg.buysuccess; break;
      case 'nosuchitem':
        string = usermsg.nosuchitem + args[0] + "."; break;
      case 'nicksuccess':
        string = usermsg.nicksuccess + args[0] + "."; break;
      case 'nicklengthshort':
        string = usermsg.nicklengthshort; break;
      case 'nicklengthlong':
        string = usermsg.nicklengthlong; break;
      case 'nosuchset':
        string = usermsg.nosuchset; break;
      case 'nonequippable':
        string = usermsg.nonequippable; break;
      case 'insufflevel':
        string = usermsg.insufflevel; break;
      case 'equipcoffer':
        string = usermsg.equipcoffer; break;
      case 'nosuchcoffer':
        string = usermsg.nosuchcoffer; break;
      case 'lootgained':
        string = args[0]; break;
      case 'nonequipped':
        string = usermsg.nonequipped; break;
      case 'unequipsuccess':
        string = usermsg.unequipsuccess1 + Format.capitalizeFirsts(args[0].name) +
          usermsg.unequipsuccess2 + "[" + Format.capitalizeFirsts(args[1]) + "]."; break;
      case 'invalidslot':
        string = usermsg.invalidslot; break;
      case 'equipsuccess':
        if (args[1] == null) {
          string = usermsg.equipsuccess1 + Format.capitalizeFirsts(args[0].name) + usermsg.equipsuccess2 + "[" +
            Format.capitalizeFirsts(args[0].slot) + "].";
        } else {
          string = usermsg.replacesuccess1 + Format.capitalizeFirsts(args[1].name) + usermsg.replacesuccess2 +
            Format.capitalizeFirsts(args[0].name) + usermsg.replacesuccess3 + "[" + Format.capitalizeFirsts(args[0].slot) + "].";
        }
        break;
      case 'itemnotpresent':
        string = usermsg.itemnotpresent; break;
      case 'notenoughgold':
        string = usermsg.notenoughgold1 + args[2] + usermsg.notenoughgold2 + args[0] + usermsg.notenoughgold3 + args[1] + "."; break;
      default:
        string = ""; break;
    }
    message.channel.send(string);
  }

  static formatPartyJoin = function (message, _, args) {
    message.channel.send(args[0].tag + " has successfully joined " + args[1].tag + "'s party.");
    let partyid = args[2], party;
    if (partyid == -1) {
      party = new Party(args[3], args[4], args[1], args[0]);
      Party.parties.set(party.party_id, party);
      updateUTIL.updateUser(args[3].id, args[3].lastmsg, args[3].busy, party.party_id, args[3].inventory,
        args[3].equipped, args[3].profile, args[3].profile.hp);
    } else { party = Party.parties.get(partyid); party.joinParty(args[4], args[0]); }
    updateUTIL.updateUser(args[4].id, args[4].lastmsg, args[4].busy, party.party_id, args[4].inventory,
      args[4].equipped, args[4].profile, args[4].profile.hp);
  }

  static awaitButtonHelper = async (message, filter, bot_msg, type, timer, replyFunction, args, isconfirm, retry, target_id) => {
    bot_msg.awaitButtons(filter, {
      max: 1,
      time: timer,
      errors: ['time']
    }).then(async (collected) => {
      const button = collected.get(Array.from(collected.keys())[0]);
      button.reply.defer();
      if ((target_id == undefined && button.clicker.id == message.author.id) ||
        (target_id != undefined && button.clicker.id == target_id)) {
        const arg = button.id.slice((message.author.id + type).length).trim();
        if (isconfirm && arg != 'Confirm') { Format.sendUserMessage(message, 'cancel'); return; }
        replyFunction(message, arg, args);
        if (retry) awaitButtonHelper(message, filter, bot_msg, type, timer, replyFunction, args, isconfirm, retry, target_id);
      } else {
        Format.awaitButtonHelper(message, filter, bot_msg, type, timer, replyFunction, args, isconfirm, retry, target_id);
      }
    }).catch(collected => {
      console.log("Error: Waited too long for button reply.");
      console.log(collected)
      return;
    })
  }

  static awaitButton = async (message, row, embed, type, timer, replyFunction, args = undefined, isconfirm = false, retry = false, target_id = undefined) => {
    let filter = b => b.id.startsWith((target_id == undefined ? message.author.id : target_id) + type);
    message.channel.send(embed, row).then((bot_msg) => {
      Format.awaitButtonHelper(message, filter, bot_msg, type, timer, replyFunction, args, isconfirm, retry, target_id);
    })
  }

  static formatInventory = function (message, args, contents, user) {
    const keys = Object.keys(user.inventory);
    if (args.length != 0) {
      var arr;
      const filter = args[0].toLowerCase();
      if (contents.includes(filter)) {
        var contents = messages.inventoryembed.displayfilter + filter + '.';
        var topfields = ["", "\u200b", "\u200b"];
        var botfields = ["", "\u200b", "\u200b"];
        var topindex = 0;
        var botindex = 0;
        for (let key of keys) {
          var item = user.inventory[key];
          const name = Format.capitalizeFirsts(item.name);
          if (item.category.includes(filter)) {
            if (filter != 'equipment' || (filter == 'equipment' && item.category.includes('weapons'))) {
              topfields[topindex] += "[" + item.quantity + "x] " + name + "\n";
              topindex = (topindex + 1) % 3;
            } else if (item.category.includes('armor')) {
              botfields[botindex] += "[" + item.quantity + "x] " + name + "\n";
              botindex = (botindex + 1) % 3;
            }
          }
        }
        const embed = Format.makeEmbed().setDescription(contents)
          .setTitle(message.author.tag + "'s Inventory")
          .addField(filter == 'equipment' ? 'Weapons' : Format.capitalizeFirsts(filter), topfields[0] == "" ? "No items found." : topfields[0], true)
          .addField('\u200b', topfields[1], true)
          .addField('\u200b', topfields[2], true);
        if (filter == 'equipment') {
          embed.addField('Armor', botfields[0] == "" ? "No items found." : botfields[0], true)
            .addField('\u200b', botfields[1], true)
            .addField('\u200b', botfields[2], true);
        }
        message.channel.send(embed);
      } else {
        var string = messages.inventoryembed.filtererror;
        for (let content of contents) {
          string += '`' + content + '`,';
        }
        message.channel.send(string.substring(0, string.length - 1));
      }
    } else {
      var items = "";
      var armor = "";
      var weapons = "";
      var consumables = "";
      var coffers = "";
      for (let key of keys) {
        var item = user.inventory[key];
        const name = Format.capitalizeFirsts(item.name);
        if (item.category.includes('items')) items += "[" + item.quantity + "x] " + name + "\n";
        else if (item.category.includes('armor')) armor += "[" + item.quantity + "x] " + name + "\n";
        else if (item.category.includes('weapons')) weapons += "[" + item.quantity + "x] " + name + "\n";
        else if (item.category.includes('consumables')) consumables += "[" + item.quantity + "x] " + name + "\n";
        else if (item.category.includes('coffers')) coffers += "[" + item.quantity + "x] " + name + "\n"
      }
      const embed = Format.makeEmbed().setDescription(messages.inventoryembed.displaynofilter)
        .setTitle(message.author.tag + "'s Inventory")
        .addField('Items', items == "" ? "No items found." : items, true)
        .addField('Weapons', weapons == "" ? "No items found." : weapons, true)
        .addField('Armor', armor == "" ? "No items found." : armor, true)
        .addField('Consumabless', consumables == "" ? "No items found." : consumables, true)
        .addField('Coffers', coffers == "" ? "No items found." : coffers, true)
        .addField('\u200b', "\u200b", true);
      message.channel.send(embed);
    }
  }

  static exceedLength = function (string, length) {
    if (string.length > length) return string.slice(0, length - 3) + "...";
    return string;
  }

  static formatProfile = function (message, user) {
    const column = 29;
    var job = Format.capitalizeFirsts(user.profile.job);
    const contents = ["```css"];
    const ptitle = user.profile.title != "" ? "[" + user.profile.title + "] " : "";
    contents.push("Displaying " + message.author.tag + "'s " + ptitle + "Profile");
    contents.push(" ");
    const plevel = "Level: " + user.profile.level + " (" + user.profile.exp + "/" + DB.exp_req[user.profile.level - 1].exp + ")";
    const pnick = "Nickname: " + user.profile.nickname;
    const pclass = "Class: " + Format.capitalizeFirsts(user.profile.job);
    const physdmg = "PHYS Damage: " + user.profile.physdmg;
    const magicdmg = "MAGIC Damage: " + user.profile.magicdmg;
    const armor = "Defense: " + user.profile.armor;
    const dungeons = "Dungeons Conquered: " + user.profile.dungeons_completed;
    const raids = "Raids Conquered: " + user.profile.raids_completed;
    const achieve = "Achievements Completed: " + user.profile.achievements;
    const date = "Adventurer Since: " + user.profile.date_joined;
    const empty = "------------------";
    const equipped = user.equipped.armor;

    const pweapon = "[ Weapon ] " + (equipped.weapon == null ? empty :
      Format.exceedLength(Format.capitalizeFirsts(equipped.weapon.name), 18));
    const phead = "[  Head  ] " + (equipped.head == null ? empty :
      Format.exceedLength(Format.capitalizeFirsts(equipped.head.name), 18));
    const pbody = "[  Body  ] " + (equipped.body == null ? empty :
      Format.exceedLength(Format.capitalizeFirsts(equipped.body.name), 18));
    const plegs = "[  Legs  ] " + (equipped.legs == null ? empty :
      Format.exceedLength(Format.capitalizeFirsts(equipped.legs.name), 18));
    const pfeet = "[  Feet  ] " + (equipped.feet == null ? empty :
      Format.exceedLength(Format.capitalizeFirsts(equipped.feet.name), 18));
    const pring = "[  Ring  ] " + (equipped.ring == null ? empty :
      Format.exceedLength(Format.capitalizeFirsts(equipped.ring.name), 18));

    contents.push(plevel + " ".repeat(column - plevel.length) + pweapon);
    contents.push(pnick);
    contents.push(pclass + " ".repeat(column - pclass.length) + phead);
    contents.push(" ".repeat(column) + pbody);
    contents.push(physdmg + " ".repeat(column - physdmg.length) + plegs);
    contents.push(magicdmg + " ".repeat(column - magicdmg.length) + pfeet);
    contents.push(armor + " ".repeat(column - armor.length) + pring);
    contents.push(" ");
    contents.push(dungeons + " ".repeat(column - dungeons.length) + raids);
    contents.push(achieve + " ".repeat(column - achieve.length) + date);
    contents.push("```");
    message.channel.send(contents);
  }

  static makeActionRow = function (message, descriptor, array, isconfirm = false, target_id = undefined) {
    let row = new MessageActionRow();
    let i = 0;
    let id = (target_id == undefined ? message.author.id : target_id);
    for (let key of array) {
      let button = new MessageButton()
        .setID("" + id + descriptor + key)
        .setLabel(key);
      if (isconfirm) {
        if (i == 0) { i++; button.setStyle("green"); }
        else { button.setStyle("red"); }
      } else button.setStyle("blurple");
      row.addComponent(button);
    }
    return row;
  }

  static formatPurchaseReply = function (message, _, args) {
    let user = args[0], item = args[1];
    userUTIL.updateItem(item, user.inventory);
    updateUTIL.updateUser(user.id, user.lastmsg, user.busy, user.partyid, user.inventory, user.equipped, user.profile, user.profile.hp);
    Format.sendUserMessage(message, 'buysuccess');
  }

  static formatTradeEmbed = function (trade) {
    let contents = [messages.tradeembed.bio, " "];
    let column = 40;
    for (let i = 0; i < 2; i++) {
      let user;
      let count = 0;
      if (i == 0) { user = trade.user1; }
      else { user = trade.user2; }
      contents.push((user.confirm ? Format.makeEmoji('default', 'check') : Format.makeEmoji('general', 'red_x')) + " ⫿ " + user.tag + " offers...");
      if (user.gold_offer > 0) {
        count++;
        let str = "`" + user.gold_offer + " coins";
        str += ' '.repeat(column - str.length + 1) + "`";
        contents.push(str)
      }
      for (let key of Object.keys(user.item_offers)) {
        count++;
        let item = user.item_offers[key];
        let str = "`[" + item.quantity + "x] " + Format.capitalizeFirsts(item.name);
        str += (' '.repeat(column - str.length + 1)) + "`";
        contents.push(str)
      }

      for (let k = count; k < 3; k++) contents.push('`' + ' '.repeat(column) + '`');
      contents.push(" ");
    }
    let embed = Format.makeEmbed().setTitle("Trade: " + trade.user1.tag + " and " + trade.user2.tag)
      .setDescription(contents);
    if (trade.bot_msg != undefined) trade.bot_msg.edit(embed);
    return embed;
  }

  static formatParty = function (message, party) {
    let contents = ["```css"];
    for (let key of Object.keys(party.members)) {
      let user = party.members[key];
      contents.push((party.isLeader(user.usergp.id) ? "[Leader] " : "         ") + "(Lv. " +
        user.usergp.profile.level + (user.usergp.profile.level < 10 ? " " : "") + ") " +
        user.tag + " (HP " + user.usergp.profile.hp + "/" + user.usergp.profile.maxhp + ")");
    }
    contents.push('```', ' ', 'Maximum members: 4, Locked: ' + party.locked);
    let embed = Format.makeEmbed().setDescription(contents)
      .setTitle("Party Details");
    message.channel.send(embed);
  }

  static formatTradeReply = function (message, _, args) {
    let trade = new Trading(message.author.id, message.author.tag, args[1], args[0]);
    let trade_id = message.author.id + "_" + args[1];
    Trading.trades.set(trade_id, trade);
    args[2].busy = "trade " + trade_id;
    args[3].busy = "trade " + trade_id;
    updateUTIL.updateUser(args[2].id, args[2].lastmsg, args[2].busy, args[2].partyid, args[2].inventory, args[2].equipped, args[2].profile, args[2].profile.hp);
    updateUTIL.updateUser(args[3].id, args[3].lastmsg, args[3].busy, args[3].partyid, args[3].inventory, args[3].equipped, args[3].profile, args[3].profile.hp);
    let embed = Format.formatTradeEmbed(trade);
    message.channel.send(embed).then(function (bot_msg) {
      trade.setMsg(bot_msg);
    })
  }

  static formatConfirmation = function (message, type, details, reply, args, target_id = undefined, alter_title = "") {
    let row = Format.makeActionRow(message, type, Format.CONFIRMATION, true, target_id);
    const embed = Format.makeEmbed().setDescription(details)
      .setTitle((alter_title == "" ? "Confirm " : alter_title + " ") + type);
    Format.awaitButton(message, row, embed, type, 20000, reply, args, true, false, target_id);
  }

  static formatMerchantReply = function (message, choice, _) {
    var contents = [messages.merchant[choice], " "];
    for (let item_id of loot.merchant_loot[choice]) {
      const item = DB.items[item_id];
      var string = "[" + item.shopcost + " coins] **" + Format.capitalizeFirsts(item.name) + "**: " +
        item.description;
      contents.push(string);
    }
    contents.push(" ", " ", messages.merchant.purchase_helper + messages.merchant[choice + "_helper"]);
    const wares = Format.makeEmbed().setDescription(contents)
      .setTitle("Merchant: " + choice);
    message.channel.send(wares);
  }

  static formatMerchant = function (message) {
    let row = Format.makeActionRow(message, "merchant", Object.keys(loot.merchant_loot));
    const bio = [messages.merchant.bio, " ", messages.merchant.bio_helper];
    const embed = Format.makeEmbed().setDescription(bio)
      .setTitle("Merchant");
    Format.awaitButton(message, row, embed, "merchant", 45000, Format.formatMerchantReply)
  }

  static formatAdvance = function (message, user) {
    const contents = [messages.advanceembed.proceed];
    let row = new MessageActionRow();
    for (let key of Object.keys(DB.p_aclasses)) {
      let entry = DB.p_aclasses[key];
      if (entry.subclass_name.toString() == user.profile.job) {
        let button = new MessageButton()
          .setStyle('blurple')
          .setID("" + message.author.id + "jobadvance " + entry.name)
          .setLabel(entry.name);
        row.addComponent(button);
        contents.push("\n**" + entry.name + "**");
        contents.push(entry.description);
      }
    }
    const embed = Format.makeEmbed().setDescription(contents)
      .setTitle(messages.advanceembed.title);
    let filter = b => b.id.startsWith(message.author.id + "jobadvance");
    message.channel.send(embed, row).then((bot_msg) => {
      bot_msg.awaitButtons(filter, {
        max: 1,
        time: 45000,
        errors: ['time']
      })
        .then(async (collected) => {
          let keys = Array.from(collected.keys());
          let button = collected.get(keys[0]);
          const job = button.id.slice((message.author.id + "jobadvance").length).trim();
          message.channel.send(messages.advancemessage.success);
          var basic_id = DB.p_aclasses[job].base_ability_id;
          var basic = DB.a_meta[basic_id];
          basic.name = DB.a_desc[basic_id].name;
          user.profile.job = job;
          user.equipped.abilities.push(basic);
          updateUTIL.updateUser(user.id, user.lastmsg, user.busy, user.partyid, user.inventory, user.equipped, user.profile, undefined);
          button.reply.defer();
        })
        .catch(collected => {
          console.log("Error: " + collected);
        })
    })
  }

  static formatLevel = function (message, user, max) {
    var embed = Format.makeEmbed().setDescription('**Level**: ' + user.profile.level + ' ``(' + user.profile.exp + "/" + max + ')``')
      .setTitle(message.author.tag + "'s player level");
    message.channel.send(embed);
  }

  static formatGold = function (message, user) {
    var embed = Format.makeEmbed().setDescription(user.profile.gold + " coins")
      .setTitle(message.author.tag + "'s gold pouch");
    message.channel.send(embed);
  }

  static foramtPartyList = function (list, embed) {
    for (let i = 0; i < list.length; i++) {
      var value = "";
      for (let j = 0; j < list[i].members.length; j++) {
        if (j == 0) value += "> ";
        else value += "\n> ";
        value += list[i].members[j].tag + " (Lv. " + list[i].members[j].usergp.profile.level + ")";
      }
      embed.addField('Party ' + (i + 1) + (list.locked ? " [Locked]" : ""), value, true);
    }
    return embed;
  }

  static formatDungeonResults = function (floor, channel) {
    var contents = ["```css"];
    contents.push(" ");
    const header = "DUNGEON CLEARED";
    var hsp = (60 - header.length) / 2;
    contents.push(" ".repeat(Math.floor(hsp)) + header);
    var text1 = "- All participants granted [1x " + Format.capitalizeFirsts(DB.equipment["d" + floor.dungeon.type.id].descriptor) + " Gear Coffer]!";
    var tsp1 = (60 - text1.length) / 2;
    var text2 = "- All participants granted " + floor.dungeon.type.gold + " gold!"
    var tsp2 = (60 - text2.length) / 2;
    contents.push(" ".repeat(Math.floor(tsp1)) + text1);
    contents.push(" ".repeat(Math.floor(tsp2)) + text2);
    contents.push(" ");
    contents.push(" ");
    var foot = "//Channel access will be removed in 60 seconds//";
    var fsp = (60 - foot.length) / 2
    contents.push(" ".repeat(Math.floor(fsp)) + foot);
    contents.push("```");
    channel.send(contents);
  }

  static formatDungeonSummary = function (combatsum, channel) {
    const column = 60;
    var contents = ["```css"];
    contents.push("Summary");
    contents.push(" ");
    for (let j = 0; j < combatsum.length; j++) {
      const detail = combatsum[j];
      const array = detail.split(/ +/);
      var string = (j + 1) + ". ";
      for (let word of array) {
        if (string.length + word.length + 1 > column) { contents.push(string); string = "   " + word + " "; }
        else string += word + " ";
      }
      contents.push(string);
    }
    contents.push(" ");
    contents.push("All users regain 5 AP.")
    contents.push("```");
    channel.send(contents);
  }

  static formatDungeonCombat = function (floor, channel, party) {
    const comembed = messages.dungeoncombatembed;
    var title = floor.dungeon.type.name + comembed.floor + floor.floor + "/" + floor.maxfloors + "]";
    var membed = Format.makeEmbed().setTitle(title);
    var mcontents = [comembed.effect + (floor.effect == null ? "None" : ("[**" + floor.effect.name + "**]   " + floor.effect.description))];
    mcontents.push("```css");
    mcontents.push(" ".repeat(61));
    mcontents.push(" ".repeat(61));
    var top = "", bot = "", setop = "", semid = "", seextra = "";
    const box_len = 60 / floor.monstersalive;
    for (let mon of floor.monsters) {
      if (!mon.dead) {
        const stateffects = mon.stateffects;
        const id = "(" + mon.id + ") ";
        const hp = "(HP: " + mon.hp + "/" + mon.maxhp + ")";
        // Top spacing
        const tsp = (box_len - mon.name.length - id.length) / 2;
        // Bot spacing
        const bsp = (box_len - hp.length) / 2;
        top += " ".repeat(Math.floor(tsp)) + id + mon.name + " ".repeat(box_len - mon.name.length - id.length - Math.floor(tsp));
        bot += " ".repeat(Math.floor(bsp)) + hp + " ".repeat(box_len - hp.length - Math.floor(bsp));
        var i = 0;
        for (let eff of stateffects) {
          // status effect spacing
          const move = DB.a_desc[eff.id];
          const sesp = (box_len - move.name.length - 6) / 2;
          const flare = eff.buff == 'true' ? "+" : "-";
          if (i == 0) setop += " ".repeat(Math.floor(sesp)) + flare + move.name + " (" + eff.stacks + ")" + flare + " ".repeat(box_len - move.name.length - 6 - Math.floor(sesp));
          if (i == 1) semid += " ".repeat(Math.floor(sesp)) + flare + move.name + " (" + eff.stacks + ")" + flare + " ".repeat(box_len - move.name.length - 6 - Math.floor(sesp));
          i++;
        }
        if (i > 2) {
          const sesp = (box_len - 8 - i.length) / 2
          seextra += " ".repeat(Math.floor(sesp)) + "..." + (i - 2) + " more";
        } else {
          if (i == 0) { setop += " ".repeat(Math.floor(box_len)); semid += " ".repeat(Math.floor(box_len)); }
          else if (i == 1) semid += " ".repeat(Math.floor(box_len));
          else if (i == 2) seextra += " ".repeat(Math.floor(box_len));
        }
      }
    }
    mcontents.push(top);
    mcontents.push(bot);
    if (setop.includes("(")) mcontents.push(setop);
    if (semid.includes("(")) mcontents.push(semid);
    if (seextra.includes("(")) mcontents.push(seextra);
    mcontents.push(" ".repeat(61));
    mcontents.push(" ".repeat(61));
    mcontents.push("```");
    membed.setDescription(mcontents);

    var pcontents = ["```css"];
    for (let i = 0; i < party.members.length; i++) {
      const user = party.members[i];
      pcontents.push("(" + (i + 1) + ") " + user.tag + " (HP " + user.usergp.profile.hp + "/" + user.usergp.profile.maxhp + ") (AP " + user.combat.ap + "/" + (user.combat.bonusap + 15) + ")");
      const len = user.usergp.equipped.consumables.length;
      if (len == 0) pcontents.push("    Item Pouch  No items in pouch");
      for (let i = 0; i < len; i++) {
        const item = user.usergp.equipped.consumables[i];
        var string = i == 0 ? "    Item Pouch  " : "                ";
        string += (i + 1) + ". (" + (item.apcost.length == 1 ? item.apcost + " " : item.apcost) + " AP) [" + item.quantity + "x] " + item.name;
        pcontents.push(string);
      }
      for (let i = 0; i < user.usergp.equipped.abilities.length; i++) {
        const ability = user.usergp.equipped.abilities[i];
        var string = i == 0 ? "    Abilities   " : "                ";
        string += (i + 1) + ". (" + ability.apcost + " AP) " + (ability.name) + " " +
          (ability.target == "all" ? "" : ability.side == "self" ? "`ally #`" : "`enemy #`");
        pcontents.push(string);
      }
      pcontents.push(" ".repeat(61));
    }
    pcontents.push("```");
    var pembed = Format.makeEmbed().setTitle(comembed.party)
      .setDescription(pcontents)
      .setFooter(comembed.footer);

    channel.send(membed);
    channel.send(pembed);
  }

  static formatDungeonSpawn = function (dungeon, server, message, max) {
    const contents = [messages.dungeonembed.intro];
    contents.push("");
    contents.push(messages.dungeonembed.type + dungeon.type.name);
    contents.push(messages.dungeonembed.difficulty + dungeon.difficulty);
    contents.push(messages.dungeonembed.level + dungeon.level);
    contents.push(messages.dungeonembed.party + dungeon.partySize);
    contents.push(messages.dungeonembed.floors + dungeon.floors);
    contents.push("");
    contents.push(messages.dungeonembed.partylist + "(0/" + max + ")");
    contents.push(messages.dungeonembed.noparty);
    contents.push("");
    const embed = Format.makeEmbed()
      .setDescription(contents)
      .setTitle(messages.dungeonembed.title)
      .setFooter(messages.dungeonembed.emptytimer1 + dungeon.timer + messages.dungeonembed.timer2);
    message.channel.send(embed).then((bot_msg) => {
      var interval;
      const countdown = function () {
        if (contents.includes(messages.dungeonembed.noparty)) { contents.pop(); contents.pop(); }
        contents.pop();
        const nembed = Format.makeEmbed();
        var footer;
        dungeon.timer -= 1;
        if (dungeon.timer == 0) {
          const parties = dungeon.partyList.length;
          if (parties == 0) footer = messages.dungeonembed.emptytimercomplete;
          else footer = messages.dungeonembed.nonemptytimercomplete;
          clearInterval(interval);
          console.log("Log: Dungeon timer done. Notifying users of auto-start.");
          const role_details = rolesUTIL.checkRoles(message.guild, server);
          for (let role of role_details[0]) {
            rolesUTIL.replaceRole(message.guild, server, role).then(function (new_role) {
              role_details[1][role] = new_role;
            })
          }
          if (parties != 0) {
            for (let i = 0; i < parties; i++) {
              var users = [];
              for (let user of dungeon.partyList[i].members) {
                users.push(message.guild.members.cache.get(user.id));
              }
              rolesUTIL.assignRole(users, role_details[1][i]);
            }
            Format.sendDungeonMessage(message, 'autostart', [server.pchannels, role_details[1], parties]);
            setTimeout(function () {
              for (let i = 0; i < parties; i++) {
                Format.sendDungeonMessage(message, 'soonstart', [server.pchannels, parties]);
              }
            }, 0);
            setTimeout(function () {
              for (let i = 0; i < dungeon.partyList.length; i++) {
                dungeon.beginDungeon(i);
                for (let user of dungeon.partyList[i].members) {
                  user.usergp.busy = 'dungeon';
                  updateUTIL.updateUser(user.usergp.id, user.usergp.lastmsg, user.usergp.busy, user.usergp.partyid,
                    user.usergp.inventory, user.usergp.equipped, user.usergp.profile,
                    user.usergp.profile.hp);
                }
              }
              const floors = dungeon.activeFloors;
              for (let i = 0; i < parties; i++) {
                Format.formatDungeonCombat(floors[i], message.guild.channels.cache.get(server.pchannels[i]), dungeon.partyList[i]);
              }
            }, 0);
            ;
          }
        } else {
          if (dungeon.partyList.length == 0) footer = messages.dungeonembed.emptytimer1 + dungeon.timer + messages.dungeonembed.timer2;
          else footer = messages.dungeonembed.nonemptytimer1 + dungeon.timer + messages.dungeonembed.timer2;
        }
        if (dungeon.partyList.length == 0) {
          contents.push(messages.dungeonembed.partylist + "(0/" + max + ")");
          contents.push(messages.dungeonembed.noparty);
          contents.push("");
        } else {
          contents.push(messages.dungeonembed.partylist + "(" + dungeon.partyList.length + "/" + max + ")")
          Format.foramtPartyList(dungeon.partyList, nembed);
        }
        nembed.setDescription(contents)
          .setTitle(messages.dungeonembed.title)
          .setFooter(footer);
        bot_msg.edit(nembed);
      }
      interval = setInterval(function () { countdown() }, 1000);
    });
  }

  static formatStart = function (message) {
    const contents = [messages.startembed.description];
    let row = new MessageActionRow();
    for (let key of Object.keys(DB.p_pclasses)) {
      let entry = DB.p_pclasses[key];
      let button = new MessageButton()
        .setStyle('blurple')
        .setID(message.author.id + "jobstart " + entry.name)
        .setLabel(entry.name);
      row.addComponent(button);
      contents.push("\n**" + entry.name + "**");
      contents.push(entry.description);
    }
    const embed = Format.makeEmbed().setDescription(contents)
      .setTitle('Your journey begins here!');
    let filter = b => b.id.startsWith(message.author.id + "jobstart");
    message.channel.send(embed, row).then((bot_msg) => {
      bot_msg.awaitButtons(filter, {
        max: 1,
        time: 45000,
        errors: ['time']
      })
        .then(async (collected) => {
          let keys = Array.from(collected.keys());
          let button = collected.get(keys[0]);
          const job = button.id.slice((message.author.id + "jobstart").length).trim();
          const profile = {
            level: 1,
            exp: 0,
            gold: 0,
            job: job,
            hp: undefined,
            maxhp: undefined,
            physdmg: undefined,
            magicdmg: undefined,
            armor: undefined,
            nickname: "",
            title: "",
            achievements: 0,
            dungeons_completed: 0,
            raids_completed: 0,
            date_joined: message.createdAt.toString().substring(4, 15)
          };
          var basic_id = DB.p_pclasses[job].base_ability_id;
          var basic = DB.a_meta[basic_id];
          basic.name = DB.a_desc[basic_id].name;
          var equipped = { armor: { head: null, body: null, legs: null, feet: null, ring: null, weapon: null }, weapon: '', abilities: [basic], consumables: [] };
          updateUTIL.updateUser(message.author.id, 0, "", -1, {}, equipped, profile, undefined);
          message.channel.send(messages.startembed.welcome);
          const usermsg = messages.usermessage;
          message.author.send(usermsg.deusintroduction1 + usermsg.deusintroduction2 + usermsg.deusintroduction3 +
            usermsg.deusintroduction4 + usermsg.deusintroduction5 + usermsg.deusintroduction6);
          button.reply.defer();
        })
        .catch(collected => {
          console.log(collected);
        })
    });
  }
}

module.exports = Format;