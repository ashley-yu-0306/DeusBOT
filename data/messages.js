require('dotenv').config();
const prefix = process.env.PREFIX;
const divider = '======================================================\n'

exports.merchant = {
  bio: `The old merchant: "*Hello, I'm back here! Oh, I haven't had a visitor in a while! Welcome! Please, tell me, honey, what would you like?*"\n`,
  bio_helper: 'Select a category to proceed.',
  purchase_helper: 'To purchase an item, use `' + prefix + 'buy <quantity> <item name>`. ',
  Consumables: `*"Alright I've got most of the consumables you can find right here in my store, alright? Don't be so picky now, I'm sure some of these will suit your needs!"*`,
  Consumables_helper: "To equip a consumable, use `" + prefix + "equip <slot #> <item name>`. To use an equipped consumable, use `" + prefix + "use <slot #>`.",
  item_not_sold: [
    `The old merchant: "*I'm sorry, dear, but I am but a frail, old woman and I do not have the means to get that. Is there anything else you would like?*"`,
    `The old merchant: "*Oh, dear, do they sell those on the Great Plains now? My, I'm getting old... Is there anything else you would like?*"`,
    `The old merchant: "*I do not think I have that here. Perhaps granny can get you something else from these shelves?*"`,
    `The old merchant: "*Oh, no, dear, would you mind if I did not have that in stock? Perhaps granny can get you something else from these shelves?*"`,
    `The old merchant: "*Oh, you know me, darling. I do not sell such a thing here. Perhaps granny can get you something else from these shelves?*"`,
    `The old merchant: "*I do not have that in stock, but maybe I can look for that next I go out. How about a small cookie for now? I baked it myself, back in my house. It's still warm!*"`,
    `The old merchant: "*Hmm, I don't have that, but-- oh! How about a small cookie for now? I baked it myself, back in my house. It's still warm!*"`
  ],
  item_not_bought: [
    `The old merchant: "*Oh no, I can't accept this, I'm sure it's rare! Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
    `The old merchant: "*That looks amazing! I do not think I can make the most out of it, though. Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
    `The old merchant: "*Oh dear, that looks valuable! Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
    `The old merchant: "*I just know you went through a lot to get that! Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
    `The old merchant: "*By the looks of it, I just know it's quite the rare item! Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
    `The old merchant: "*My son was telling me about that the other day! I heard it's quite valuable! Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
    `The old merchant: "*A what! Oh dear- Adventurers would do anything to get their hands on that! Really, you should keep it! I'm sure you would put it to great use, dear.*"`,
  ],
  purchase_initiate: 'You are about to purchase [{0}x {1}] for {2} gold. Your remaining balance will be {3} gold. Proceed?',
  purchase_success: 'Successfully purchased [{0}x {1}].',
  sell_initiate: 'You are about to sell [{0}x {1}] for {2} gold. You will have {3} of that item left. Proceed?',
  sell_all_initiate: 'You are about to sell all of your items under the "Items" category for {0} gold. Proceed?',
  sell_success: 'Successfully sold [{0}x {1}].',
  sell_all_success: 'Successfully sold all of your items under the "Items" category.',
  no_items: "You do not have items in your inventory under the category 'items'. Please try again with an individual item."
}

exports.syntax = {
  set_channel: 'Syntax: `' + prefix + 'setchannel <party #> <channel>` (example: ' + prefix + 'setchannel 3 #dungeon-3)',
  buy: 'Syntax: `' + prefix + 'buy <optional: item quantity> <item name>` (example: ' + prefix + 'buy 2 small health pot)',
  sell: 'Syntax: `' + prefix + 'sell <optional: item quantity> <item name>` (example: ' + prefix + 'sell 2 small health pot)',
  achievements: 'Syntax: `' + prefix + 'achievements <optional: achievement #>` (example: ' + prefix + 'achievements 2)',
  equip: 'Syntax: `' + prefix + 'equip <set name> <piece name>` (example: ' + prefix + 'equip wooden pants)',
  open: 'Syntax: `' + prefix + 'open <set name>` (example: ' + prefix + 'open broken)',
  party_invite: 'Syntax: `' + prefix + 'party invite @<user name>` (example: ' + prefix + 'party invite @Deus)',
  trade_invite: 'Syntax: `' + prefix + 'trade @<user name>` (example: ' + prefix + 'trade @Deus)',
  unequip: 'Syntax: `' + prefix + 'unequip <slot>` (example: ' + prefix + 'unequip body)',
  do: 'Syntax: `' + prefix + 'do <ability #> <situational: target #>` (example: ' + prefix + 'do 1 1)',
  undo: 'Syntax: `' + prefix + 'undo <action in action queue>` (example: ' + prefix + 'undo do 1 1)',
  use: 'Syntax: `' + prefix + 'use <item #> <situational: target #>` (example: ' + prefix + 'use 1 1)',

}

exports.partymessage = {
  unlock: 'Successfully unlocked party. If you are in a dungeon lobby, please leave and re-join for the effects to register.',
  lock: 'Successfully locked party. If you are in a dungeon lobby, please leave and re-join for the effects to register.,',
  usernotinparty: 'This user is not in your party.',
  appointsuccess1: 'Successfully appointed ',
  appointsuccess2: ' as party leader.',
  kicksuccess1: 'Successfully kicked',
  kicksuccess2: ' from the party.',
  leaderonly: 'Only the leader can use party-related commands.',
  kickleader: 'You cannot kick yourself. If you wish to leave the party, please enter `' + prefix + "p leave`.",
  disband: 'This party has been disbanded.',
  hasleft: ' has left the party.',
  disband_success: 'Successfully disbanded the party.',
  newleader: ' has been appointed as party leader.',
  selfleader: 'You have been appointed as party leader.'
}

exports.party = {
  not_leader: 'Only the party leader can execute this command.',
  invite_initiation: '{0}, {1} has invited you to their party. Accept?',
  not_in_party: 'You are not in a party. Please try again after joining or creating a party.',
  lock: 'The party is now locked.',
  unlock: 'The party is now unlocked.',
  target_not_in_party: '{0} is not in your party. Please invite them to your party or try again with another party member.',
  appoint_success: '{0} has successfully appointed {1} as party leader.',
  kick_leader: 'The leader of the party cannot be kicked. Please try again with another member.',
  kick_success: '{0} has been successfully kicked from the party.',
  party_leave: '{0} has left the party.',
  party_disband_notif: 'The party you are in has been disbanded.',
  party_disband: 'You have successfully disbanded the party.',
  reassign_other_success: '{0} has been promoted to party leader.',
  reassign_self_success: 'You have been promoted to party leader.'
}

exports.open = {
  no_such_set: "There is no set with the name '{0}'. Please try again with the" +
    " name of a valid set.",
  missing_coffer: "You do not have a coffer with the name {0} in your inventory. " +
    "Please try again with a coffer you possess.",
  obtained: "{0} has obtained [{1}x {2}] and [{3}x {4}]."
}

exports.set_channel = {
  NaN: "'{0}' is not a number. Please try again with a number between 1 to 6.",
  OOB: "'{0}' is not a valid number. Please try again with a number between 1 to 6.",
  no_such_channel: '{0} is not a valid text channel. Please try again with a valid text channel.',
  invalid_channel_type: '{0} is a {1} channel. Please try again with a text channel.',
  set_success: "Successfully set {0} as the channel for party {1}. The channel's " +
    "permissions have been modified to only allow party members to send messages " +
    "within the channel.",
  prev_unset: 'Please set the channels for preceding parties before proceeding. Refer to ' +
    '`' + prefix + 'sconfig` for more details.',
  dup_warning: '{0} is already being used as the dungeon channel for party {1}. ' +
    'To allow multiple parties to operate in the same channel, turn on the option' +
    ' in `' + prefix + 'sconfig`.',
}

exports.nickname = {
  nick_long: "Your nickname must be 15 characters or less.",
  nick_short: "Your nickname must be at least 3 characters.",
  nick_chars: "Your nickname can only contain letters or digits.",
  nick_remove: "Successfully removed nickname.",
  nick_success: "Successfully changed your nickname to {0}."
}

exports.equip = {
  no_such_set: "There is no set with the name '{0}'. Please try again with the name of a valid set.",
  equip_coffer: "You cannot equip a coffer. Please try again with a piece of equipment.",
  wrong_class: "You do not possess '{0}' that is equippable by your class. " +
    "Please try again after obtaining such an equipment.",
  equip_success: "Successfully equipped [{0}] into slot '{1}'.",
  replace_success: "Successfully replaced [{2}] with [{0}] in slot '{1}'.",
  invalid_slot: "{0} is not a valid slot. Please try again with one of your equipment slots.",
  unequip_success: "Successfully unequipped [{0}] from slot {1}.",
  none_equipped: "You do not have anything equipped in slot {0}."
}

exports.achievements = {
  NaN: "'{0}' is not a number. Please try again with a number.",
  no_such_ach: "There is no achievement with ID '{0}'. Please try again with another ID."
}


exports.dungeon = {
  inactive_dungeon: "There is no active dungeon in your server. Please try again after a dungeon spawns.",
  not_in_party: "You are not in a dungeon party. Please try again after joining a dungeon.",
  in_party: "You are already in a dungeon party. Please leave your current party or wait for the dungeon to begin.",
  not_dungeon_channel: "You are not in your dungeon channel. Please try again -------.",
  no_such_monster: "There is no monster with ID {0}. Please try again with a valid ID number.",
  dead_monster: "The monster with ID {0} is already dead. Please try again with another ID number.",
  already_done: "You have already confirmed your actions for your turn. Please try again next turn.",
  no_such_ability: "You do not have an ability with ID {0}. Please try again with a valid ID number.",
  no_such_item: "You do not have an item at index {0} in your item pouch. Please try again with a valid ID number.",
  no_target: "You must specify a target for this action. Please try again with an ID number.",
  insuff_AP: "You do not have enough AP to do that. Please undo a previous action or end your turn with `" + prefix + "done`.",
  insuff_items: "You do not have enough of that item to do that. Please try another action or end your turn with `" + prefix + "done`.",
  action_added: "Successfully added action to action queue. You have {0} AP remaining.",
  turn_confirmed_notdone: "Successfully completed your turn. Now awaiting {0}.",
  turn_confirmed_done: "Successfully completed your turn. All users have now completed their turn.",
  expired: "This dungeon has already expired. Please try again after a new dungeon spawns.",
  no_slots: "There are no more slots available in this dungeon. Please try again after a new dungeon spawns.",
  join_notif: "{0} (Lv. {1}) has joined the party. There are now {2} slots open. The dungeon will begain in {3} seconds.",
  party_join_notif: "A pre-made party of {0} members has joined the party. There are now {1} slots open. The dungeon will begin in {2} seconds.",
  join_success: "You have successfully joined party {0} with {1} other users. You will be notified if any other users join the party. The dungeon will begin in {2} seconds.",
  ul_party_join_success: "Your party has successfully joined party {0} with {1} other users. You will be notified if any other users join the party. The dungeon will begin in {2} seconds.",
  l_party_join_success: "Your party has successfully joined party {0}. The dungeon will begin in {1} seconds.",
  other_in_party: "Member {0} of your party is already in this dungeon. Please try again after they have left the dungeon party or after they have left your party.",
  action_queue_empty: "Your action queue is already empty.",
  no_such_action: "The action '{0}' is not in your action queue. Please try again with an action in your action queue.",
  undo_use_success: "Successfully removed action `{0}` from your action queue. You now have {1} {2} and {3} AP remaining.",
  undo_do_success: "Successfully removed action `{0}` from your action queue. You now have {1} AP remaining.",

  warning: divider + '{0}```This dungeon will automatically begin in 15 seconds. Make any last minute preparations while you can! Please adjust your window size so that the ==== dividers do not break into the next line for the best experience.```' + divider,
  soon_start: 'This dungeon will begin in 5 seconds.'
}

exports.trade = {
  mention_user: 'To begin trading, mention another user.',
  trade_initiation: '{0}, {1} has invited you to a trade. Proceed?',
  not_in_trade: 'You are not currently in a trade. Please try again after initiating a trade.',
  insuff_gold: 'You do not have enough gold to do that.',
  no_item: "You do not have the item '{0}' in your inventory.",
  trade_complete: "The trade has been completed. All items and gold have been deposited in your inventories."
}

exports.gen_messages = {
  advance_success: "Alas, adventurer. You continue to impress me. Please refer to \`" + prefix + "help\` for more information about your new class.",
  confirm: '{0} has confirmed the operation.',
  cancel: '{0} has canceled the operation.',
  caravan_begin: '*The caravan sets out, heading into the wilderness. We should be back in 2 hours.*'
}

exports.gen_errors = {
  self_no_acc: 'You do not have a character yet! To start your journey, enter \`' + prefix + 'start\`.',
  other_no_acc: '{0} does not have a character yet.',
  self_busy_dungeon: 'You cannot execute this command while in a dungeon. Please complete the dungeon before trying again.',
  other_busy_dungeon: '{0} is in a dungeon. Please try again after they have completed the dungeon.',
  req_level: 'You must be level {0} to do that. Please try again after reaching level {0}.',
  has_advanced: 'You have already advanced your class.',
  no_such_item: 'There is no item with the name {0}.',
  insuff_gold: 'You need {0} gold to do that. Please try again after obtaining more gold.',
  confirmation_cancel: 'The operation has been canceled.',
  target_self: 'You cannot target yourself with that command.',
  no_such_user: 'There is no user with ID {0} in your server. Please try again with a valid user.',
  self_has_acc: 'You already have a character! For more guidance, enter `' + prefix + 'help`.',
  missing_args: "Missing arguments. Please try again with the missing arguments.",
  enter_again: "An error has occurred. Please enter the command again.",
  not_enough_items: "You do not have enough of that item do to that. Please try again with a lesser quantity.",

  deusintroduction1: 'Welcome, adventurer! I will occassionaally send messages to notify you of information related to your journey in this direct message channel. This includes the following:',
  deusintroduction2: '\n\t\t\t\t• Party-related notifications\n\t\t\t\t• ...and more!\n',
  deusintroduction3: 'Feel free to configure these notifications to your liking with \`' + prefix + 'config\`. ',
  deusintroduction4: 'If you need help getting started, please refer to \`' + prefix + 'help\` for some short tutorials! ',
  deusintroduction5: 'With that being said, good luck on your adventures!',

}

exports.inventoryembed = {
  filtererror: 'This category does not exist! Please try again with any one of these categories: ',
  displaynofilter: 'Displaying all items in your inventory.',
  displayfilter: 'Displaying all items in your inventory of category '
}

exports.tradeembed = {
  bio: 'Please refer to `' + prefix + 'help trade` for trading commands. The trade will end' +
    ' once both users confirm their trade or the trade times out.'
}

exports.advance_embed = {
  title: 'Narrow down on your specialty and become even stronger!',
  bio: "To proceed, choose the class you would like to using the buttons below."
}

exports.levelembed = {
  titile: `'s level`,
  level: 'Level',
  exp: 'EXP'
}

exports.dungeoncombatembed = {
  floor: " [Floor: ",
  effect: "**Floor Effect**: ",
  party: "Party Members",
  footer: "To use an ability, use " + prefix + "do <ability #> <target #>. To use an item, use " + prefix +
    "use <#>. For a quick dungeon tutorial, use " + prefix + "help dungeon."
}

exports.dungeondisplaynames = new Map([
  ['caverns', 'The Deep, Dark Caverns']
]);

exports.dungeonembed = {
  title: 'The search party has discovered a dungeon!',
  intro: `To join, enter \`${prefix}join\` before the timer ends. If no parties are formed before then, the dungeon will expire. For more information, please explore \`${prefix}help\`.`,
  type: '**Type**: ',
  difficulty: '**Difficulty**:    ',
  level: '**Average Level**:    ',
  party: '**Maximum Party Size**:    ',
  floors: '**Floors**:   ',
  partylist: '***Party List*** ',
  emptytimer1: 'The dungeon will expire in ',
  nonemptytimer1: 'The dungeon will begin in ',
  timer2: 's.',
  emptytimercomplete: 'The dungeon has expired.',
  nonemptytimercomplete: 'The dungeon has already begun.',
  noparty: "*No parties have been formed yet.*"
}

exports.startembed = {
  title: 'Your journey begins here!',
  description: `To begin, choose your starting class with one of the buttons below.`,
  welcome: "Welcome, adventurer. We hope to see you do great things. For more guidance, enter \`" + prefix + "help\`.",
  invalidclass: " is not a valid class. Please try again."
}

