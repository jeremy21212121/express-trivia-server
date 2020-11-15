/**
 * Tests getQuestions, the route handler for /start
 */

const assert = require("assert").strict;
// route handler to be tested
const getQuestions = require("../../handlers/getQuestions.js");
// An array of objects that let's us translate between category IDs and names
const categoriesArray = require("../../db/categoriesArray.js");
// string[] of valid category IDs
const validCategories = require("../helpers/validCategories.js");
// returns true if passed a non-zero length string
const isString = require("../helpers/isString.js");
// test wrapper for route handlers
const {
  mockRequest,
  mockHandlerRunner,
} = require("../helpers/mockHandlerWrapper.js");
// string[][] of valid category IDs. Non-deterministic, will be different each run.
const sampleOfValidMultiCategoryArrays = require("../helpers/sampleValidMultiCatArrays.js");
const validateQuestionObject = require("../helpers/validateQuestionObject.js");
const validators = require("../helpers/validators.js");

module.exports = () => {
  describe("route handler getQuestions (/start)", () => {
    describe("single categories", () => {
      let responses;
      const requests = [];
      it("call with each valid category without rejecting", () => {
        return assert.doesNotReject(async () => {
          responses = await Promise.all(
            validCategories.map((cat) => {
              const mockReq = mockRequest({ categories: [cat] });
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
