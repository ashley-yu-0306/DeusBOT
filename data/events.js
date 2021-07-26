exports.achievements = [
  'advance', 'dungeon_any_complete', 'dungeon_unique_complete'
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
  }
}
