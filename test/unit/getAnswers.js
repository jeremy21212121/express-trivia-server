/**
 * This tests the getAnswers async function which queries the DB and
 * returns question/answers of the given category/quantity.
 *
 * getAnswers is used by the getQuestions route handler
 */
const assert = require("assert").strict;
const colorize = require("../helpers/colorize.js");
const getAnswers = require("../../utils/getAnswers.js");

const categoriesArray = require("../../db/categoriesArray.js");
const validCategories = require("../helpers/validCategories.js");

const validAnswerProperties = [
  "category",
  "type",
  "difficulty",
  "question",
  "correct_answer",
  "incorrect_answers",
  "correctIndex",
  "_id",
];

// returns true when passed a non-zero length string
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
  isString,
];

const validateAnswerArray = (arr) =>
  arr.every((answerObj) =>
    Object.keys(answerObj).every((key) => {
      const categoryIndex = validAnswerProperties.findIndex(
        (str) => str === key
      );
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

// for logging times for performance purposes
//perf const start = (name = "") => ({ time: Date.now(), name });
//perf const stop = (start) => console.log(`${start.name} ${Date.now() - start.time}ms`);

module.exports = () => {
  describe(colorize.describeString('Function', {name: 'getAnswers', type: 'function'}), () => {
    describe("single category", () => {
      let answers = [];

      it("call every valid category without rejecting (awaits 24 calls to getAnswers)", () => {
        return assert.doesNotReject(async () => {
          //perf const t = start(`getAnswers x${validCategories.length}`);
          answers = await Promise.all(
            validCategories.map((cat) => getAnswers(cat, 10))
          );
          //perf stop(t);
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

      it("every answer is of the correct category", () => {
        answers.forEach((catAnswerArray, catIndex) => {
          const correctKey = (catIndex + 9).toString();
          const catDict = categoriesArray.find((obj) => obj.key === correctKey);
          assert.ok(
            catDict !== undefined && catDict.apiName,
            `Unable to find category ${correctKey}`
          );
          catAnswerArray.forEach((ansObj) => {
            assert.strictEqual(ansObj.category, catDict.apiName);
          });
        });
      });

      // it("throws when passed invalid categories", () => {
      //   return assert.rejects(
      //      Promise.all(
      //       invalidCategories.map((cat) => getAnswers(cat, 10))
      //     )
      //   );
      // invalidCategories.forEach(invalidCategory => {
      //   assert.throws(()=> new Promise(async (resolve, reject) => {
      //     await getAnswers(invalidCategory, 10).catch(e=>reject(e))
      //     resolve(true)
      //   }), `Should have thrown error when passed invalid category value: ${invalidCategory}`)
      // })
      // })
    });
    describe("any category", () => {
      let answers = [];

      it("doesn't reject promise", async () => {
        const prom = getAnswers("any", 10);
        prom.then((val) => (answers = val));
        await assert.doesNotReject(prom);
      });

      it("answers come from >= 3 different categories", () => {
        const catCounter = {};
        answers.forEach((ansObj) => (catCounter[ansObj.category] = true));
        const catCount = Object.keys(catCounter).length;
        assert.ok(catCount >= 3, `Only ${catCount} different categories`);
      });

      it("every answer has the required properties", () => {
        assert.ok(validateAnswerArray(answers));
      });
    });
  });
};
