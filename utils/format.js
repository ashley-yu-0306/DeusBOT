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
const events = require('../data/events.js');
const Achievement = require('../classes/achievements.js');
const { MessageActionRow, MessageButton } = require('discord-buttons');

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

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

  static makeActionRow = function (message, descriptor, array, isconfirm = false, target_id = undefined) {
    let row = new MessageActionRow();
    let id = (target_id == undefined ? message.author.id : target_id);
    for (let i = 0; i < array.length; i++) {
      let button = new MessageButton().setID("" + id + descriptor + array[i]).setLabel(array[i]);
      if (isconfirm) {
        if (i == 0) { i++; button.setStyle("green"); }
        else { button.setStyle("red"); }
      } else button.setStyle("blurple");
      row.addComponent(button);
    }
    return row;
  }

  /**
   * Capitalize the first character of the string [input] and return
   * the resulting string. This method does not capitalize prepositions 
   * specified in Format.PREPOSITION.
   * 
   * @param {*} input   a string
   * @returns           a string with the first letter of every word capitalized
   */
  static capitalizeFirsts = function (input) {
    var string = "";
    const args = input.split(/ +/);
    for (let arg of args) {
      if (!this.PREPOSITION.includes(arg)) string = string + arg.charAt(0).toUpperCase() + arg.slice(1) + " ";
      else string = string + arg + " ";
    }
    return string.slice(0, string.length - 1);
  }

  static sendMessage = function (message, string, syntaxError = '', user = undefined) {
    string += syntaxError == '' ? '' : "\n" + syntaxError;
    if (user != undefined) user.send(string);
    else message.channel.send(string);
  }

  static formatAchievements(message, args, user, messages) {
    let contents = []
    let embed = Format.makeEmbed().setThumbnail(message.author.avatarURL());
    let user_prog = user.data.achievement_prog;
    if (args.length != 0) {
      let event_name = events.achievements[parseInt(args[0]) - 1];
      if (event_name == undefined) { Format.sendMessage(message, no_such_ach.format(args[0])); return; }
      let event = events.events[event_name];
      let prog = user_prog[event.achievement.id];
      if (prog == undefined) prog = 0;
      embed.setTitle(event.achievement.name);
      contents.push("**Description**: " + event.description);
      let str = "**Tier Goals**:　[";
      let required;
      for (let i = 0; i < event.achievement.ths.length; i++) {
        let val = event.achievement.ths[i];
        str += (i < prog ? "**" : "") + " " + val + " " + (i < prog ? "**" : "");
        if (required == undefined && val > prog) required = val;
        if (i != event.achievement.ths.length - 1) str += "/";
        else if (required == undefined) required = val;
      }
      str += "]";
      contents.push(str);
      contents.push("**Tier Progress**:　" + prog + "/" + required);

      contents.push(" ");
      if (event.types != undefined) {
        contents.push("**" + event.achievement.type_description + "**");
        let user_event = user.data.event_data[event_name];
        for (let i = 0; i < event.types.length; i++) {
          let str = "　(";
          let mask = 1 << i;
          let type = Format.capitalizeFirsts(event.types[i]);
          let goal = event.achievement.type_ths[i];
          if (user_event != undefined && user_event.types_bits & mask) str += goal + "/" + goal + ")";
          else str += 0 + "/" + goal + ")";
          str += " " + type;
          contents.push(str);
        }
        contents.push(" ");
      }
      for (let key of Object.keys(event.achievement.tier_rewards)) {
        let id = event.achievement.tier_rewards[key];
        let str = "Tier " + key + " reward: ";
        if (event.achievement.reward_type == 'title') {
          str += "Title ";
          if (isNaN(id)) {
            str += "(varies)";
            contents.push(str);
            break;
          }
          str += "[" + DB.titles[id].title + "]"
        }
        contents.push(str);
      }
    } else {
      embed.setTitle("Achievements");
      for (let key of Object.keys(events.events)) {
        let event = events.events[key];
        if (event.achievement != undefined) {
          console.log(user_prog)
          let id = event.achievement.id + 1;
          let header = '`' + id + '`　**' +
            event.achievement.name + "** `(" + (user_prog[id - 1] == undefined ? 0 : user_prog[id - 1]) + "/" + event.achievement.tiers + ")`";
          contents.push(header);
        }
      }
    }
    embed.setDescription(contents);
    message.channel.send(embed);
  }

  static formatPartyJoin = function (message, _, args) {
    message.channel.send(args[0].tag + " has successfully joined " + args[1].tag + "'s party.");
    let partyid = args[2], party;
    if (partyid == -1) {
      party = new Party(args[3], args[4], args[1], args[0]);
      Party.parties.set(party.party_id, party);
      args[3].data.partyid = party.party_id;
      updateUTIL.updateUser(args[3].id, args[3].lastmsg, arags[3].data, args[3].inventory,
        args[3].equipped, args[3].profile, args[3].profile.hp);
    } else { party = Party.parties.get(partyid); party.joinParty(args[4], args[0]); }
    args[4].data.partyid = party.party_id;
    updateUTIL.updateUser(args[4].id, args[4].lastmsg, args[4].data, args[4].inventory,
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
        if (isconfirm && arg != 'Confirm') { Format.sendMessage(message, messages.gen_messages.confirmation_cancel); return; }
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
    const achieve = "Achievements Completed: " + user.profile.achievement_count;
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
    console.log(achieve)
    console.log(achieve.length)
    console.log(column)
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

  static formatPurchaseReply = function (message, _, args) {
    let user = args[0], item = args[1];
    userUTIL.updateItem(item, user.inventory);
    updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, user.profile.hp);
    Format.sendMessage(message, messages.merchant.purchase_success.format(item.quantity, item.name));
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
    args[2].data.busy = "trade " + trade_id;
    args[3].data.busy = "trade " + trade_id;
    updateUTIL.updateUser(args[2].id, args[2].lastmsg, args[2].data, args[2].inventory, args[2].equipped, args[2].profile, args[2].profile.hp);
    updateUTIL.updateUser(args[3].id, args[3].lastmsg, args[3].data, args[3].inventory, args[3].equipped, args[3].profile, args[3].profile.hp);
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

  static formatAdvanceReply = function (message, job, args) {
    message.channel.send(messages.gen_messages.advance_success);
    let user = args[0];
    var basic_id = DB.p_aclasses[job].base_ability_id;
    var basic = DB.a_meta[basic_id];
    basic.name = DB.a_desc[basic_id].name;
    user.profile.job = job;
    user.equipped.abilities.push(basic);
    updateUTIL.updateUser(user.id, user.lastmsg, user.data, user.inventory, user.equipped, user.profile, undefined).then(function () {
      Achievement.triggerEvent(message, user, 'advance', job.toLowerCase(), 1);
    })
  }

  static formatAdvance = function (message, user) {
    const classes = Object.keys(DB.p_aclasses).filter(e => DB.p_aclasses[e].subclass_name == user.profile.job)
    let row = Format.makeActionRow(message, "advance", classes);
    const contents = [messages.advance_embed.bio];
    for (let key of classes) {
      let entry = DB.p_aclasses[key];
      contents.push("\n**" + entry.name + "**");
      contents.push(entry.description);
    }
    const embed = Format.makeEmbed().setDescription(contents).setTitle(messages.advance_embed.title);
    Format.awaitButton(message, row, embed, "advance", 45000, Format.formatAdvanceReply, [user])
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

  static formatTitles = function (message, args, titles) {
    let contents = [];
    let count = 1;
    for (let title of titles) {
      contents.push("`" + count + "`　" + title);
      count++;
    }
    if (count == 1) contents.push("No titles found. Try completing some achievements!");
    message.channel.send(Format.makeEmbed().setDescription(contents).setTitle("Titles").setThumbnail(message.author.avatarURL()));
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
            for (let i = 0; i < parties; i++) {
              Format.sendMessage(message, messages.dungeon.warning.format("<@&" + role_details[1][i].id + ">"), '', message.guild.channels.cache.get(server.pchannels[i]));
            }
            setTimeout(function () {
              for (let i = 0; i < parties; i++) {
                Format.sendMessage(message, messages.dungeon.soon_start, '', message.guild.channels.cache.get(server.pchannels[i]));
              }
            }, 0);
            setTimeout(function () {
              for (let i = 0; i < dungeon.partyList.length; i++) {
                dungeon.beginDungeon(i);
                for (let user of dungeon.partyList[i].members) {
                  user.usergp.data.busy = 'dungeon';
                  updateUTIL.updateUser(user.usergp.id, user.usergp.lastmsg, user.usergp.data,
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
          const data = {
            partyid: -1,
            busy: '',
            event_data: {},
            achievement_prog: [],
            titles: [], // Unlocked titles
          };
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
            achievement_count: 0,
            dungeons_completed: 0,
            raids_completed: 0,
            date_joined: message.createdAt.toString().substring(4, 15)
          };
          var basic_id = DB.p_pclasses[job].base_ability_id;
          var basic = DB.a_meta[basic_id];
          basic.name = DB.a_desc[basic_id].name;
          var equipped = { armor: { head: null, body: null, legs: null, feet: null, ring: null, weapon: null }, weapon: '', abilities: [basic], consumables: [] };
          updateUTIL.updateUser(message.author.id, 0, data, {}, equipped, profile, undefined);
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