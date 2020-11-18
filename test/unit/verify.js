const assert = require("assert").strict;
const colorize = require("../helpers/colorize.js");
const {
  validateIndex,
  validateSession,
  // evaluateGuess,
  // buildResponseAndAdvance,
} = require("../../utils/verify");

const validateIndexTest = () => {
  describe(
    colorize.describeString("Function", {
      name: "validateIndex",
      type: "function",
    }),
    () => {
      describe("correctly handles valid and invalid inputs", () => {
        it("returns true when passed integers and strings 0-3", () => {
          const input = [0, 1, 2, 3, "0", "1", "2", "3"];
          const output = input.map((n) => validateIndex(n));
          const invalidIndex = output.findIndex((bool) => bool === false);
          assert.ok(
            output.every((bool) => bool === true),
            `Incorrectly returned false for input: ${input[invalidIndex]}`
          );
        });
        it("returns false when passed invalid values", () => {
          const input = [
            -1,
            4,
            "8",
            11,
            "15",
            77,
            NaN,
            undefined,
            null,
            "",
            { a: 1 },
            [1, 2, 3],
            () => "abc",
          ];
          const output = input.map((n) => validateIndex(n));
          const invalidIndex = output.findIndex((bool) => bool === true);
          assert.ok(
            output.every((bool) => bool === false),
            `Incorrectly returned true for input: ${input[invalidIndex]}`
          );
        });
      });
    }
  );
};

const validSessionValues = {
  currentQuestion: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  score: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  gameOver: [false],
};
const MockSession = function () {
  this.answers = [];
  this.questions = [];
  this.currentQuestion = 0;
  this.score = 0;
  this.gameOver = false;
};

const validateSessionTest = () => {
  describe(
    colorize.describeString("Function", {
      name: "validateSession",
      type: "function",
    }),
    () => {
      describe("correctly handles valid and invalid inputs", () => {
        it("handles all valid currentQuestion values", () => {
          validSessionValues.currentQuestion.forEach((n) => {
            const mockSesh = new MockSession();
            mockSesh.currentQuestion = n;
            assert.ok(
              validateSession(mockSesh),
              `Incorrectly returned false for input: ${n}`
            );
          });
        });
        it("handles all valid score values", () => {
          validSessionValues.score.forEach((n) => {
            const mockSesh = new MockSession();
            mockSesh.score = n;
            assert.ok(
              validateSession(mockSesh),
              `Incorrectly returned false for input: ${n}`
            );
          });
        });
        it("returns false if gameOver is true", () => {
          const mockSesh = new MockSession();
          mockSesh.gameOver = true;
          const isValid = validateSession(mockSesh);
          assert.ok(!isValid, "Incorrectly returned true");
        });
      });
    }
  );
};

module.exports = () => {
  describe("file /utils/verify.js", () => {
    validateIndexTest();
    validateSessionTest();
  });
};
