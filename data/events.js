exports.achievements = [
  'advance', 'dungeon_any_complete', 'dungeon_unique_complete'
]

exports.quests = [
  {
    name: "The Greatest Bond",
    id: 0,
    player_req: 2,
    tiers: 3,
    intro: 'You unravel the tathered scroll and find what seems to be a written letter: ' +
      '\n"*A bond between two individuals should not be underestiamted as ' +
      'what can be accomplished by a pair is seldom possible in solitude. It makes one ' +
      'feel powerful, unstoppable, on top of the world... As if anything could go wrong ' +
      'and all would still be right. Such a bond is not easy to come by, and yet, ' +
      'some still forget to cherish what they have, and may one day find themselves ' +
      'without what was most important to them. I, too, am a victim of such a past, and ' +
      'have written this in an effort to save others from taking the path that I took. ' +
      'Before that, though, tell me adventurers...What bonds the two of you?*"' +
      '\n**Select one of the options below.**',
    paths: ["Friendship", "Love"],
    tiers_data: [
      {
        title: "The Gift of Time",
        description: "The future is infinite and this trait is frequently taken advantage of. " +
          "After all, what could be done today that cannot be done tomorrow? As such, " +
          "we sometimes assume that we have all the time in the world to spend with " +
          "those close to us— now is just not the right time. But, if this is the case, " +
          "when will the next time be? Next week? Next month? Next year? We seldom set " +
          "strict dates for something as simple as quality time, but hopefully, " +
          "this will change, at least during the time that you are reading this letter. ",
        event_name: 'exploration_1hr_complete',
        reward_type: 'exp',
        reward_id: -1,
        reward_amount: 500,
      },
      {
        title: "The Gift of Loyalty",
        description: "Nothing strengthens a bond between two individuals more " +
          "than a time of hardship and difficulty. In our world, riddled with " +
          "monsters and thugs alike, one’s greatest fear is undoubtedly the Grim Reaper " +
          "himself. But, as I have mentioned, and as I am sure you know for yourselves, " +
          "the power that two people who are connected by {0} (love or friendship), an " +
          "individual’s strength multiplies infinitely. Though it may seem daunting, " +
          "nothing, really, is too difficult for one who is cherished. ",
        reward_type: 'exp',
        reward_id: -1,
        reward_amount: 500,
      },
      {
        title: "The Gift of {0}",
        description: "Though it may frequently slip one’s mind, especially in " +
          "the case of a long-lasting relationship, a good way, more often than not, " +
          "to show appreciation is through a simple gift. It does not have to be pricey, " +
          "nor grand— just something to show that they have been on your mind.",
        reward_type: 'exp',
        reward_id: -1,
        reward_amount: 800,
      }
    ]
  }
]

exports.events = {
  'advance': {
    description: 'Advance your class to any one of the available classes.',
    types: ['holy knight', 'dark knight', 'sorcerer', 'priest', 'reaper', 'ninja'],
    achievement: {
      id: 0,
      name: 'A New Light',
      reward_type: 'title',
      tiers: 1,
      ths: [1],
      type_description: 'Available classes (choose one):',
      type_ths: [1, 1, 1, 1, 1, 1],
      tier_rewards: {
        1: {
          'holy knight': 0, // ID of the reward
          'dark knight': 1,
          'sorcerer': 2,
          'priest': 3,
          'reaper': 4,
          'ninja': 5
        }
      }
    }
  },
  'dungeon_any_complete': {
    description: 'Successfully complete a dungeon.',
    achievement: {
      id: 1,
      name: 'Siege the Dungeons!',
      reward_type: 'title',
      tiers: 3,
      ths: [10, 25, 50],
      tier_rewards: {
        2: 6
      }
    }
  },
  'dungeon_unique_complete': {
    description: 'Successfully complete each type of dungeon at least once.',
    types: ["the deep, dark caverns", "the great thick", "cliffside campsite", "abandoned thalorian town"],
    achievement: {
      id: 2,
      name: 'Dungeon Dweller',
      reward_type: 'title',
      tiers: 4,
      type_description: 'Completed dungeons:',
      ths: [1, 2, 3, 4],
      type_ths: [1, 1, 1, 1],
      tier_rewards: {
        4: 7
      }
    }
  },
  'exploration_1hr_complete': {
    description: 'Successfully complete a 1-hour exploration.'
  },
  'gift_of_purchase': {
    description: 'Purchase "The Gift of {0}" from the merchant.'
  }
}
