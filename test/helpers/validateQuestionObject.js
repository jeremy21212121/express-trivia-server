// returns true if passed a non-zero length string
const isString = require("../helpers/isString.js");
/**
 *  Used by validateQuestionObject (function) for validating questionObjects.
 *  { name: {string} - property name, validate: {function} - validates this props value }[]
 */
const questionObjectProperties = [
  { name: "category", validate: isString },
  {
    name: "type",
    validate: (type) => type === "multiple" || type === "boolean",
  },
  {
    name: "difficulty",
    validate: (difficulty) =>
      difficulty === "easy" || difficulty === "medium" || difficulty === "hard",
  },
  { name: "question", validate: isString },
  {
    name: "_id",
    // true if id is a valid hex string with a value greater than a somewhat-arbitrary presumed-safe value.
    // these are md5 hashes. it would take the hash starting with 18 consecutive 0's for this to fail, which is highly unlikely.
    // the security of md5 is not relevant in this context. Even a decent GPU would have trouble finding such a hash, see https://stackoverflow.com/questions/25341517/md5-hash-with-leading-zeros
    validate: (id) => BigInt(`0x${id}`) > BigInt(Number.MAX_SAFE_INTEGER),
  },
  {
    name: "possible_answers",
    validate: (maybeArr) =>
      Array.isArray(maybeArr) &&
      maybeArr.every((maybeString) => isString(maybeString)),
  },
];

/**
 * Validates the properties and values of the question object returned by route handler.
 * Depends on 'questionObjectProperties' array for the property names and value validation functions.
 * @param {object} questionObj - Question object returned from route handler
 * @returns {boolean}
 */
const validateQuestionObject = (questionObj) => {
  const properties = Object.keys(questionObj);
  return properties.every((propName) => {
    const propertyValidatorIndex = questionObjectProperties.findIndex(
      (obj) => obj.name === propName
    );
    return (
      propertyValidatorIndex !== -1 &&
      questionObjectProperties[propertyValidatorIndex].validate(
        questionObj[propName]
      )
    );
  });
};

module.exports = validateQuestionObject;
