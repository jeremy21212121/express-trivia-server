const assert = require("assert").strict;
const colorize = require("../helpers/colorize.js");
const verifyThenNextQuestion = require("../../handlers/verifyThenNextQuestion.js");
// test wrapper for route handlers and mock request generation
const {
  // mockRequest,
  mockHandlerRunner,
  generateMockRequestObjectsForVTNQRouteHandler,
} = require("../helpers/mockHandlerWrapper.js");
const validateQuestionObject = require("../helpers/validateQuestionObject.js");
const getRandInt = require("../../utils/getRandomInt.js");

module.exports = () => {
  describe(
    `${colorize("handler", "route handler")} ${colorize("keyword", "Function")} ${colorize("function", "verifyThenNextQuestion")} ${colorize("detail", "(/verify)")}`,
    () => {
      describe("single category", () => {
        let requests;
        let responses;
        it("call once for each category without rejecting", () => {
          return assert.doesNotReject(async () => {
            requests = await generateMockRequestObjectsForVTNQRouteHandler.singleCategories();
            assert.ok(requests.every(req => req !== undefined), 'We got undefinedsdssed')
            // update the request bodies before passing them to the route handler. The current request body is intended for the /start route handler.
            requests = requests.map((req, reqIndex) => {
              // Set request body
              // We will guess repeating cycles of 0-3. Half of these values will be out of the sane range for boolean type (true/false) questions, however the route handler will not choke on this and will simply indicate an incorrect guess. It will reduce our odds of a correct guess by 50%, but that doesn't matter here.
              req.body = { guess: reqIndex % (3+1) };
              return req
            });
            responses = await Promise.all(
              requests.map((req) =>
                mockHandlerRunner(verifyThenNextQuestion, req)
              )
            );
          });
        });
        it("every response was successful", () => {
          const invalidIndex = responses.findIndex(
            (res) => res.status !== 200 || !res.payload.success
          );
          const valid = invalidIndex === -1;
          assert.ok(
            valid,
            `Response: ${invalidIndex}; Invalid status: ${
              !valid ? responses[invalidIndex].status : ""
            }`
          );
        });
        it("every response results object is valid", () => {
          const invalidIndex = responses.findIndex(
            (res) =>
              !res.payload.results ||
              ![0, 1].includes(res.payload.results.score) ||
              typeof res.payload.results.isCorrectGuess !== "boolean"
          );
          const valid = invalidIndex === -1;
          assert.ok(
            valid,
            `Response: ${invalidIndex}; Invalid results object: ${
              !valid
                ? JSON.stringify(responses[invalidIndex].payload.results)
                : ""
            }`
          );
        });
        it("every response questionData object is valid", () => {
          const invalidIndex = responses.findIndex(
            (res) =>
              !res.payload.questionData ||
              !res.payload.questionData.number ||
              !res.payload.questionData.question ||
              !validateQuestionObject(res.payload.questionData.question)
          );
          const valid = invalidIndex === -1;
          assert.ok(
            valid,
            `Response: ${invalidIndex}; Invalid questionData object: ${
              !valid
                ? JSON.stringify(responses[invalidIndex].payload.questionData)
                : ""
            }`
          );
        });
      });
    }
  );
};
