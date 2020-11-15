const getRandomInt = require("../../utils/getRandomInt.js");
// string[] of valid category IDs
const validCategories = require("../helpers/validCategories.js");

/**
 * Generates valid multi-category arrays. Non-deterministic.
 * @param {number} length - Number of random valid categories to return
 * @returns {string[]} - Array of valid category strings
 */
const pickRandomCategories = (length) => {
  const output = [];
  while (output.length < length) {
    const nextCategory =
      validCategories[getRandomInt(validCategories.length - 1)];
    if (!output.includes(nextCategory)) {
      output.push(nextCategory);
    }
  }
  return output;
};

/**
 * A non-deterministic sampling of 20 arrays of valid category keys.
 * Category ID arrays have a length between 2 and 10.
 * Used for testing 'getQuestions' route handler.
 * {string[][]}
 */
const sampleOfValidMultiCategoryArrays = Array.from(
  Array(20),
  // returns a number between 1-10
  () => getRandomInt(8) + 2
  // gets 'n' random valid categories
).map((n) => pickRandomCategories(n));

module.exports = sampleOfValidMultiCategoryArrays;
