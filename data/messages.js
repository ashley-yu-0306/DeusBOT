require('dotenv').config();
const prefix = process.env.PREFIX;

exports.syntaxmessage = {
  syntax: 'Syntax: ',
  setchannel: prefix + 'setchannel `number` `channel`'
}

exports.merchant = {
  bio: `*"Well, well... I'm sure I have some wares for the likes of you. Why don't you browse around, hmm?"*\n`,
  bio_helper: 'Select a category to proceed.',
  purchase_helper: 'To purchase an item, use `' + prefix + 'buy <quantity> <item name>`. ',
  Consumables: `*"Alright I've got most of the consumables you can find right here in my store, alright? Don't be so picky now, I'm sure some of these will suit your needs!"*`,
  Consumables_helper: "To equip a consumable, use `" + prefix + "equip <slot #> <item name>`. To use an equipped consumable, use `" + prefix + "use <slot #>`."
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

exports.servermessage = {
  NaN: ' is not a number. Please enter a number from 1 to 6.',
  OOB: ' is not a valid number. Please enter a number from 1 to 6.',
  nochannel: 'That is not a valid channel. Please try again and mention a channel using `#<channel name>`, without the < and >.',
  invalidchannel1: ' is a ',
  invalidchannel2: ' channel. Please try again with a text channel.',
  setsuccess1: 'Successfully set ',
  setsuccess2: ' as the channel for party ',
  setsuccess3: ". The channel's permissions have been modified to only allow party members to send messages within the channel.",
  prevmissing: 'Please set the channels for the following parties before proceeding: ',
  dupwarning1: ' is already being used as the dungeon channel for party ',
  dupwarning2: '. As it is not recommended to use one channel for more than one party due to the clutter and confusion, you must manually turn this option on in `' + prefix + 'sconfig`.'
}

exports.usermessage = {
  finderror: 'You do not have a character yet! To start your journey, enter \`' + prefix + 'start\`.',
  finderrorother: 'That user does not have a character yet.',
  haserror: `You already have a character! For more guidance, enter \`${prefix}help\`.`,
  deusintroduction1: 'Welcome, adventurer! I will occassionaally send messages to notify you of information related to your journey in this direct message channel. This includes the following:',
  deusintroduction2: '\n\t\t\t\t• Party-related notifications\n\t\t\t\t• ...and more!\n',
  deusintroduction3: 'Feel free to configure these notifications to your liking with \`' + prefix + 'config\`. ',
  deusintroduction4: 'If you need help getting started, please refer to \`' + prefix + 'help\` for some short tutorials! ',
  deusintroduction5: 'With that being said, good luck on your adventures!',
  equipsuccess1: 'Successfully equipped ',
  equipsuccess2: ' in slot ',
  replacesuccess1: 'Successly replaced ',
  replacesuccess2: ' with ',
  replacesuccess3: ' in slot ',
  itemnotpresent: 'This item is not in your inventory.',
  NEargs: 'Please enter at least two arguments in this syntax: \`' + prefix + ' <set name> <category>\`',
  nosuchset: 'This set does not exist.',
  nonequippable: 'You do not have equippable equipment of that name. Please ensure that you are of the correct class to equip the specified equipment.',
  insufflevel: 'You are not of a sufficient level to equip this item.',
  equipcoffer: 'You cannot equip a coffer.',
  nosuchcoffer: 'You do not have this coffer in your inventory.',
  nicklengthlong: 'Your nickname must be 15 characters or less.',
  nicklengthshort: 'Your nickname must be at least 3 characters.',
  charsonly: 'Your nickname may only contain either letters (A-Z, a-z) or numbers (0-9).',
  nicksuccess: 'Successfully changed nickname to ',
  nickremove: 'Successfully removed nickname.',
  nosuchitem: 'There is no item with the name ',
  notenoughgold1: 'You do not have enough gold (',
  notenoughgold2: ') to purchase [',
  notenoughgold3: 'x] ',
  buysuccess: 'Purchase successful.',
  cancel: 'Operation successfully canceled.',
  invalidslot: 'This is not a valid equipment slot.',
  nonequipped: 'Nothing is equipped in that equipment slot.',
  unequipsuccess1: 'Successfully unequiped ',
  unequipsuccess2: ' from slot ',
  mentionuser: 'Please mention a user using @<user name>.',
  busydungeon: 'This command cannot be used while in a dungeon. Please try again after completing the dungeon.',
  targetbusydungeon: 'This command cannot be used while the target user is in a dungeon. Please try again after they have completed the dungeon.',
  tradeself: 'You cannot initiate a trade with yourself.',
  notintrade: 'You cannot use trade commands unless you are in a trade.',
  notenoughgoldtrade: 'You do not have enough gold to do that.',
  canttradenoitem: 'You do not have such an item in your inventory.',
  notenoughitems: 'You do not have enough of that item to do that.',
  tradecomplete: 'The trade has completed.',
  notinparty: 'You are not in a party.',
  inviteself: 'You cannot invite yourself to a party.',
  someoneinerror: 'Someone in your party is already in a dungeon.',
  enterachnumber: 'Please enter the number of the achievement that you would like additional details for.',
  nosuchachievement: 'There is no achievement with that ID number. Please try again with another ID number.'

}

exports.inventoryembed = {
  filtererror: 'This category does not exist! Please try again with any one of these categories: ',
  displaynofilter: 'Displaying all items in your inventory.',
  displayfilter: 'Displaying all items in your inventory of category '
}

exports.dungeonmessage = {
  noneerror: 'There is no active dungeon to join! Please try again when a dungeon appears.',
  doneerror: 'There is no active dungeon in your server! Please try again after joining a dungeon.',
  nopartyerror: "You are not in a party! Please try again after joining a party the next time a dungeon appears.",
  expireerror: 'The dungeon has already expired. Please try again when a dungeon appears.',
  channelerror1: "Please send dungeon-related commands in your party's channel (<#",
  channelerror2: ">) to avoid confusion.",
  inerror: 'You have already joined the dungeon!',
  joinsuccess1: 'You have successfully joined the dungeon! You are in party ',
  joinsuccess2: ' with ',
  joinsuccess3single: ' other user. You will be notified if others join the party.',
  joinsuccess3plural: ' other users. You will be notified if others join the party.',
  joinnotif1: ' has joined the party! ',
  joinnotifopensingle: 'There is 1 open position left',
  joinnotifopen1plural: 'There are ',
  joinnotifopen2plural: ' open positions left.',
  joinnotiffull: 'The party is now full. ',
  partyjoinsuccess1: 'Your party has successfully joined the dungeon! Your party is in party ',
  partyjoinsuccessul1: ' with ',
  partyjoinsuccessul2: ' other users. You will be notified if others join the party.',
  partyjoinsuccessl1: '. As your party is locked, no additional members be able to join your room. To unlock your party, enter `' + prefix + "p unlock`.",
  diddone1: 'Action queue confirmed: [',
  diddone2: ']. ',
  diddonewait: 'Now waiting for: ',
  maxreached: 'Unfortunately, all parties in the dungeon are already full. ',
  notmaxcapacity1: 'Each server can have a maximum of 6 parties but your server currently allows ',
  notmaxcapacity2: " parties. Reach out to your server's admins to increase the cap for future dungeons.",
  divider: '======================================================\n',
  autostart: "```This dungeon will automatically begin in 15 seconds. Make any last minute preparations while you can! Please adjust your window size so that the ==== dividers do not break into the next line for the best experience.```",
  soonstart: "This dungeon will begin in 5 seconds.",
  itemindexerror: 'You do not have an item in that index of your item pouch.',
  abilindexerror: 'You do not have an ability of that index.',
  insuffap: 'You do not have enough AP to do that! Please try another action or finish your turn with \`' + prefix + 'done\`.',
  didaction1: 'Added action to action queue: [',
  didaction2: ']. You have ',
  didability3: ' AP remaining.',
  didaction3: ' AP and ',
  didaction4: ' remaining.',
  insuffitem: 'You do not have any more of this item!',
  emptyactionqueue: 'There are no actions to remove.',
  nosuchaction1: 'The specified action is not present in your action queue: [',
  nosuchaction2: '].',
  undosuccess1: "Successfully removed '",
  undosuccess2: "' from your action queue: [",
  undosuccess3: "]. You have ",
  undosuccess4: ' AP and ',
  undosuccess5: ' remaining.',
  targetnumber: 'This ability requires a target number.',
  invmonsternumber: 'There is no monster with that ID number.',
  deadmonster: 'The monster with that ID number is already dead. Please target another monster.',
  turncomplete: 'You have already completed your turn. Please wait until the next turn before trying again.'
}

exports.tradeembed = {
  bio: 'Please refer to `' + prefix + 'help trade` for trading commands. The trade will end' +
    ' once both users confirm their trade or the trade times out.'
}

exports.advancemessage = {
  insufflevel: "You must be at least level 10 to advance your class. For tips on how to level up, refer to the help menu at \`" + prefix + "help\`.",
  success: "Alas, adventurer. You continue to impress me. Please refer to \`$" + prefix + "help\` for more information about your new class.",
  invalid: " is not a valid class. Please try again."
}

exports.advanceembed = {
  title: 'Narrow down on your specialty and become even stronger!',
  proceed: "To proceed, choose the class you would like to using the buttons below."
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
  title: 'A wild dungeon has appeared!',
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

exports.general = {
  sessionexpired: 'The session has expired.'
}
