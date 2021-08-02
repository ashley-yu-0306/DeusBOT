class Random {
  /** Returns a random integer betweem min and max-1.
 * 
 * @param {*} min the minimum number the random generator can return
 * @param {*} max the maximum number the random generator can return
 */
  static getRandomInt(min = 0, max, float = false) {
    if (float) return Math.random();
    return Math.floor(Math.random() * max) + min;;
  }

  static getRandomItem(list) {
    return list[this.getRandomInt(0, list.length)];
  }

  static getFromChance(entries, chances) {
    let roll = this.getRandomInt(0, 1, true), valid_entries = [];
    for (let i = 0; i < entries.length; i++) {
      let chance, entry = entries[i];
      if (chances != undefined) chance = chances[i];
      else chance = entry.chance;
      if (chance > roll) valid_entries.push(entry); 
    }
    return this.getRandomItem(valid_entries);
  }
}

module.exports = Random;