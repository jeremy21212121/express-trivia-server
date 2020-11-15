/**
 * Returns true if the 'maybeString' argument is a non-zero length string.
 * @param {(string|any)} maybeString - Maybe a string
 * @returns {boolean} - True if arg is non-zero length string
 */
const isString = (maybeString) =>
  typeof maybeString === "string" && maybeString.length > 0;

module.exports = isString;
