/**
 * An array of the valid category keys.
 * Consists of number strings 9 through 32
 *
 * 'any' is also a valid category but that is handled separately
 */
const validCategories = Array.from(Array(32 - 8))
  .map((_el, i) => i + 9)
  .map((n) => n.toString(10));

Object.freeze(validCategories);

module.exports = validCategories;
