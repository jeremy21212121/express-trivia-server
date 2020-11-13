/**
 * Tests getQuestions, the route handler for /start
 */
const assert = require("assert").strict;
const getQuestions = require("../../handlers/getQuestions.js");
const categoriesArray = require("../../db/categoriesArray.js");
const validCategories = require("../helpers/validCategories.js");
// const getAnswers = require("../../utils/getAnswers.js");
const getRandomInt = require("../../utils/getRandomInt.js");

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

/**
 * Validates that the 'maybeString' argument is a non-zero length string.
 * @param {(string|any)} maybeString - Maybe a string
 * @returns {boolean} - True if arg is non-zero length string
 */
const isString = (maybeString) =>
  typeof maybeString === "string" && maybeString.length > 0;

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
    // true if id is a valid hex string with a value greater than an somewhat-arbitrary presumed-safe value.
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
 * Creates a mock request object for testing route handlers
 * @param {string[]} categoryArray - Array of category ID strings
 * @returns {object} - Mock request object
 */
const mockRequest = (body) => ({
  body,
  session: {},
});

/**
 * Test wrapper for route handlers. Rejects if next is called with anything other than undefined.
 * This wrapper allows calling route handlers
 * @param {function} handler - async route handler
 * @param {object} mockReq - Mock request object with all required properties
 * @returns {object} - .status and .payload
 */
const mockHandlerRunner = (handler, mockReq) =>
  new Promise(async (resolve, reject) => {
    const mockResponse = {
      status: (status) => ({
        json: (obj) => resolve({ status, payload: obj }),
      }),
      json: (obj) => resolve({ status: 200, payload: obj }),
    };

    const mockNext = (maybeError) => {
      if (maybeError !== undefined) {
        reject(maybeError);
      } else {
        resolve(true);
      }
    };
    // this promise is resolved or rejected in the handler function
    await handler(mockReq, mockResponse, mockNext);
    // return response;
  });

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

// logging times for performance purposes
//perf const start = (name = "") => ({ time: Date.now(), name });
//perf const stop = (start) => console.log(`${start.name} ${Date.now() - start.time}ms`);

module.exports = () => {
  describe("route handler getQuestions (/start)", () => {
    describe("single categories", () => {
      let responses;
      const requests = [];
      it("call with each valid category without rejecting", () => {
        return assert.doesNotReject(async () => {
          //perf const t = start(`getQuestions x${validCategories.length}`)
          responses = await Promise.all(
            validCategories.map((cat) => {
              const mockReq = mockRequest({ categories: [cat] });
              requests.push(mockReq);
              return mockHandlerRunner(getQuestions, mockReq);
            })
          );
          //perf stop(t)
          // console.log(requests[0])
          // console.log(requests[0].session.answers[0])
          // console.log(requests[0].session.questions[0])
        });
      });
      describe("validate responses", () => {
        it("every response has an HTTP status of 200", () => {
          validators.httpStatus(responses, 200);
        });
        it("every response payload indicates success", () => {
          validators.payloadSuccess(responses);
        });
        it("every response includes question data", () => {
          validators.questionDataObjects(responses);
        });
        it("every response indicates it is the first question", () => {
          validators.questionNumber(responses, 0);
        });
        it("every question returned is for the intended category", () => {
          responses.forEach((resp, respIndex) => {
            // use array index to determine correct category key
            const correctKey = (respIndex + 9).toString();
            // use the correct key to find the object that helps us translate from key to name
            const catObj = categoriesArray.find(
              (obj) => obj.key === correctKey
            );
            // the actual category returned
            const actualCategory = resp.payload.questionData.question.category;
            // make sure we found the category object. This is tested separately and should always succeed
            // providing the unit test for 'array categoriesArray' passed
            assert.ok(
              catObj !== undefined && isString(catObj.apiName),
              `Unable to find category object for key: ${correctKey}`
            );
            // assert that the category is correct
            assert.strictEqual(actualCategory, catObj.apiName);
          });
        });
        it("every question object is valid", () => {
          responses.forEach((resp, respIndex) => {
            const categoryId = (respIndex + 9).toString();
            const questionObj = resp.payload.questionData.question;
            assert.ok(
              validateQuestionObject(questionObj),
              `Question object id ${questionObj._id} for category ${categoryId} is invalid`
            );
          });
        });
      });
      describe("validate request objects", () => {
        it("every mock request object contains a valid session object", () => {
          validators.sessionObjects(requests);
        });
      });
    });
    describe("multiple random categories (non-deterministic)", () => {
      let responses;
      const requests = [];
      const categoryKeys = sampleOfValidMultiCategoryArrays;
      it("calls a sampling of multiple categories without rejecting", () => {
        return assert.doesNotReject(async () => {
          responses = await Promise.all(
            categoryKeys.map((keyArr) => {
              const mockReq = mockRequest({ categories: keyArr });
              requests.push(mockReq);
              return mockHandlerRunner(getQuestions, mockReq);
            })
          );
        });
      });
      describe("validate responses", () => {
        it("every response has an HTTP status of 200", () => {
          validators.httpStatus(responses, 200);
        });
        it("every response payload indicates success", () => {
          validators.payloadSuccess(responses);
        });
        it("every response includes question data", () => {
          validators.questionDataObjects(responses);
        });
        it("every response indicates it is the first question", () => {
          validators.questionNumber(responses, 0);
        });
        it("every response question is from one of the selected categories", () => {
          const invalidIndex = responses.findIndex((resp, respIndex) => {
            // an array of catgeory IDs, our response should come from one of these categories
            const expectedCategories = categoryKeys[respIndex].map((key) =>
              categoriesArray.find((obj) => obj.key === key)
            );
            // this has been tested earlier but we need to be sure none of them are undefined some might as well throw it in an assert
            // it should never fail. If it does, perhaps there is something wrong with our test category generation code
            assert.ok(
              expectedCategories.every((cat) => cat !== undefined),
              "Couldn't find expected category object. Shouldn't be possible if test 'array categoriesArray' passed."
            );
            const expectedApiNames = expectedCategories.map(
              (cat) => cat.apiName
            );
            const actualCategory = resp.payload.questionData.question.category;
            return !expectedApiNames.includes(actualCategory);
          });
          let errorString = "";
          if (invalidIndex !== -1) {
            errorString = `Response: ${invalidIndex}; Got: ${actualCategory}, expected one of: ${expectedCategories.join(
              ", "
            )}`;
          }
          assert.ok(invalidIndex === -1, errorString);
        });
      });
      describe("validate request objects", () => {
        it("every mock request object contains a valid session object", () => {
          validators.sessionObjects(requests);
        });
      });
    });
  });
};

// used for generating mock request object for passing to /verifyThenNext handler
// we need the /start handler to mutate the session object so it is in a valid state
// for calling our intended route handler
const generateMockRequestObjectsForVTNQRouteHandler = {
  singleCategories: async () =>
    await Promise.all(
      validCategories.map(async (cat) => {
        const mockReq = mockRequest({ categories: [cat] });
        // mutate mockReq by passing it to route handler. This will add the session state required for calling VTNQ handler.
        await mockHandlerRunner(getQuestions, mockReq);
        return mockReq;
      })
    ),
  // non-deterministic sampling
  multipleCategories: async () =>
    await Promise.all(
      sampleOfValidMultiCategoryArrays.map(async (catArray) => {
        const mockReq = mockRequest({ categories: catArray });
        await mockHandlerRunner(getQuestions, mockReq);
        return mockReq;
      })
    ),
};
