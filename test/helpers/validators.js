const assert = require("assert").strict;
// string[] of valid category IDs
const validCategories = require("../helpers/validCategories.js");
/**
 * Indicates if 'maybeArray' arg is an array of objects of expected length.
 * @param {object[]} maybeArray - The array to be validated
 * @param {number} length - The array length to be validated against
 * @returns {boolean}
 */
const validateObjectArray = (maybeArray = [], length = 10) =>
  Array.isArray(maybeArray) &&
  maybeArray.length === length &&
  maybeArray.every((maybeObj) => typeof maybeObj === "object");

/**
 * For validation of session objects mutated by route handler
 */
const sessionObjectProperties = [
  {
    name: "answers",
    validate: validateObjectArray,
  },
  {
    name: "questions",
    validate: validateObjectArray,
  },
  {
    name: "currentQuestion",
    validate: Number.isSafeInteger,
  },
  {
    name: "score",
    validate: Number.isSafeInteger,
  },
  {
    name: "gameOver",
    validate: (maybeBool, shouldBe = false) =>
      typeof maybeBool === "boolean" && maybeBool === shouldBe,
  },
];

/**
 * Asserts that invalidIndex === -1
 * @param {number} invalidIndex
 * @param {string} status
 * @param {string} categoryId
 */
const assertStatusOk = (invalidIndex, status, categoryId) =>
  assert.ok(
    invalidIndex === -1,
    `Invalid HTTP status code ${status} for category: ${categoryId}`
  );

const getStatus = (responseIndex, responses) =>
  responseIndex === -1 ? null : responses[responseIndex].status;

const getQuestionNumber = (responses, invalidIndex) =>
  invalidIndex !== -1 ? responses[invalidIndex].payload.questionData.number : 0;

const validators = {
  httpStatus(responses, expectedStatus = 200) {
    // an invalidIndex value of -1 indicates success
    // this approach enables more useful error messages (We will have the relevant index if an individual request failed)
    const invalidIndex = responses.findIndex(
      (res) => res.status !== expectedStatus
    );
    return assertStatusOk(
      invalidIndex,
      getStatus(invalidIndex, responses),
      validCategories[invalidIndex]
    );
  },
  payloadSuccess(responses) {
    const invalidIndex = responses.findIndex((res) => !res.payload.success);
    return assert.ok(
      invalidIndex === -1,
      `Success value is not true for category ${validCategories[invalidIndex]}`
    );
  },
  questionDataObjects(responses) {
    const invalidIndex = responses.findIndex(
      (res) =>
        !res.payload.hasOwnProperty("questionData") ||
        typeof res.payload.questionData !== "object" ||
        !res.payload.questionData.hasOwnProperty("number") ||
        !res.payload.questionData.hasOwnProperty("question")
    );
    return assert.ok(
      invalidIndex === -1,
      `Invalid questionData object for category ${validCategories[invalidIndex]}`
    );
  },
  questionNumber(responses, number = 0) {
    const invalidIndex = responses.findIndex(
      (res) => res.payload.questionData.number !== number
    );
    return assert.ok(
      invalidIndex === -1,
      `Invalid question number (${getQuestionNumber(
        responses,
        invalidIndex
      )}) for category ${validCategories[invalidIndex]}`
    );
  },
  sessionObjects: (requests) => {
    return requests.forEach((mockReq, mockReqIndex) => {
      const hasSessionObject =
        mockReq.hasOwnProperty("session") &&
        typeof mockReq.session === "object";
      assert.ok(
        hasSessionObject,
        `Missing session object for request ${mockReqIndex}: ${JSON.stringify(
          mockReq
        )}`
      );
      const hasRequiredProperties = Object.keys(mockReq.session).every(
        (key) => {
          const validator = sessionObjectProperties.find(
            (obj) => obj.name === key
          );
          return validator && validator.validate(mockReq.session[key]);
        }
      );
      assert.ok(
        hasRequiredProperties,
        `Session object for request ${mockReqIndex} is invalid: ${JSON.stringify(
          mockReq.session
        )}`
      );
    });
  },
};

module.exports = validators;
