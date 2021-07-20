class Random {
  /** Returns a random integer betweem min and max-1.
 * 
 * @param {*} min the minimum number the random generator can return
 * @param {*} max the maximum number the random generator can return
 */
  static getRandomInt(min = 0, max) {
    return Math.floor(Math.random() * max) + min;
  }

  static getRandomItem(list) {
    return list[this.getRandomInt(0, list.length)];
  }
}

module.exports = Random;