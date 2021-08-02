exports.dungeon_loot = [
  // ID: 1, Caverns
  [ // item id, min amount obtainable, max amount obtainable
    { item_id: 0, min: 1, max: 2, chance: 1 },
    { item_id: 1, min: 1, max: 1, chance: 0.6 }
  ]
]

exports.merchant_loot = {
  // Arrays contain item IDs.
  Consumables: [0, 1]
}

exports.exploration_loot = [
  // ID: 0, traveling merchant event (exploration)
  [ // item id, min amount obtainable, max amount obtainable, chance 
    { item_id: 3, min: 1, max: 1, chance: 0.10 },
    { item_id: 4, min: 1, max: 1, chance: 0.8 },
    { item_id: 5, min: 1, max: 1, chance: 0.45 },
    { item_id: 6, min: 1, max: 1, chance: 1 },
    { item_id: 7, min: 1, max: 1, chance: 0.6 }
  ],
  // ID: 1, abandoned wagon event (exploration)
  [
    { item_id: -1, min: 800, max: 1600, chance: 1 },
    { item_id: 8, min: 1, max: 2, chance: 0.25 },
    { item_id: 9, min: 1, max: 1, chance: 0.5 },
    { item_id: 10, min: 1, max: 1, chance: 0.7 }
  ],
  // ID: 2, small_town jewelry store (exploration)
  [
    { item_id: 16, min: 1, max: 1, chance: 1 },
    { item_id: 17, min: 1, max: 1, chance: 1 },
    { item_id: 22, min: 1, max: 1, chance: 0.6 },
    { item_id: 20, min: 1, max: 1, chance: 0.05 }
  ],
  // ID: 3, lumberjack carrying wood (exploration)
  [
    { item_id: 12, min: 2, max: 4, chance: 1 },
    { item_id: 11, min: 1, max: 1, chance: 0.5 },
    { item_id: 13, min: 1, max: 1, chance: 0.5 },
    { item_id: -1, min: 200, max: 450, chance: 0.8 }
  ],
  // ID: 4, children learning magic (exploration)
  [
    { item_id: 12, min: 2, max: 4, chance: 1 },
    { item_id: 14, min: 1, max: 1, chance: 0.5 },
    { item_id: 15, min: 1, max: 1, chance: 0.5 },
    { item_id: -1, min: 200, max: 450, chance: 0.8 }
  ],
  // ID: 5, adventurer in cart (exploration)
  [
    { item_id: 18, min: 1, max: 1, chance: 1 },
    { item_id: 19, min: 1, max: 1, chance: 1 },
    { item_id: 21, min: 1, max: 1, chance: 0.05 },
    { item_id: 23, min: 1, max: 1, chance: 0.05 }
  ],
]

//     { item_id: , min: , max: , chance: }
