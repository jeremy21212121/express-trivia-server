/**
 * This tests the getAnswers async function which queries the DB and returns question/answers of the given category/quantity
 */
const assert = require("assert").strict;
const getAnswers = require("../../utils/getAnswers.js");

// number strings 9-32 inclusive
const validCategories = Array.from(Array(32 - 8))
  .map((el, i) => i + 9)
  .map((n) => n.toString(10))

const validAnswerProperties = [
  "category",
  "type",
  "difficulty",
  "question",
  "correct_answer",
  "incorrect_answers",
  "correct_index",
];

const isString = (str) => typeof str === "string" && str.length > 0;
// functions that validate their respective properties
const answerPropertyValidators = [
  isString,
  isString,
  isString,
  isString,
  isString,
  Array.isArray,
  Number.isSafeInteger,
];

const validateAnswerArray = (arr) =>
  arr.every((answerObj) =>
    Object.keys(answerObj).every((key) => {
      const categoryIndex = validAnswerProperties.findIndex(key);
      return answerPropertyValidators[categoryIndex](answerObj[key]);
    })
  );

const uniqueAnswerIds = (catArray) => {
  const obj = {};
  catArray.forEach((answerObj) => {
    if (!obj[answerObj._id]) {
      obj[answerObj._id] = 0;
    } else {
      obj[answerObj._id]++;
    }
  });
  return Object.keys(obj).every((key) => obj[key] === 0);
};

module.exports = () => {
  describe("getAnswers", () => {
    let answers = [];

    it("call every valid category without rejecting", async () => {
      assert.doesNotReject(async () => {
        answers = await Promise.all(
          validCategories.map((cat) => getAnswers(cat, 10))
        );
      });
    });

    it("returns valid responses for every category", () => {
      const isValid = answers.every((cat) => validateAnswerArray(cat));
      assert.ok(isValid, "One or more responses failed validation");
    });

    it("returns correct quantity of question/answers for each category", () => {
      assert.ok(answers.every((cat) => cat.length === 10));
    });

    it("every category has unique answer/questions", () => {
      assert.ok(
        answers.every((cat) => uniqueAnswerIds(cat)),
        "Duplicate answer detected"
      );
    });
  });
};
