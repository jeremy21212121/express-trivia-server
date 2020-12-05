/**
 * Tests db.js, the CRUD api for our DB
 */

const assert = require("assert").strict;
const colorize = require("../helpers/colorize.js");

const { db } = require("../../utils/db.js");

module.exports = () => {
  describe("file utils/db.js", () => {
    let recordCount = 0;
    let exisitingQuestion;
    let newQuestion;
    let newCount = 0;
    const testQuestion = {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "medium",
      question: "Fake question for testing?",
      correct_answer: "Test0",
      incorrect_answers: ["Test1", "Test2", "Test3"],
    };
    const questionProps = [...Object.keys(testQuestion), "_id"];
    describe(
      colorize.describeString("Function", {
        name: "db.numberOfRecords",
        type: "function",
      }),
      () => {
        it("doesn't reject", () => {
          return assert.doesNotReject(async () => {
            recordCount = await db.numberOfRecords();
          });
        });
        it("returns a sane number", () => {
          assert.ok(
            recordCount > 0 && recordCount < 1000000,
            `Unreasonable number of records: ${recordCount}`
          );
        });
      }
    );
    describe(
      colorize.describeString("Function", {
        name: "db.findAnswers",
        type: "function",
      }),
      () => {
        describe("Get a single question from the DB", () => {
          it("doesn't reject", () => {
            return assert.doesNotReject(async () => {
              exisitingQuestion = await db.findAnswers({ category: "any" }, 1);
            });
          });
          it("has all required properties", () => {
            const exisitingQuestionKeys = Object.keys(exisitingQuestion[0]);
            assert.ok(
              questionProps.every((key) => exisitingQuestionKeys.includes(key)),
              `Unexpected prop found: ${JSON.stringify(
                Object.keys(exisitingQuestion)
              )}
              ${JSON.stringify(questionProps)}`
            );
          });
        });
        describe("Attempt to get an invalid category", () => {
          let postAttemptRecordCount = 0;
          it("rejects with 'invalid-category'", async () => {
            const err = await db
              .findAnswers({ category: NaN }, 1)
              .catch((e) => e);
            assert.strictEqual(err.message, "invalid-category");
          });
          it("record count does not change", () => {
            return assert.doesNotReject(async () => {
              postAttemptRecordCount = await db.numberOfRecords();
              assert.strictEqual(postAttemptRecordCount, recordCount);
            });
          });
        });
        describe("Pass an object with a circular reference", () => {
          const circular = { a: true };
          circular.b = circular;
          it("resolves to an empty array", async () => {
            const maybeErr = await db
              .findAnswers({ circular, category: "22" })
              .catch((e) => e);
            assert.ok(
              Array.isArray(maybeErr) && maybeErr.length === 0,
              `Expected array, got: ${JSON.stringify(maybeErr)}`
            );
          });
        });
      }
    );
    describe(
      colorize.describeString("Function", {
        name: "db.insertQuestion",
        type: "function",
      }),
      () => {
        let duplicateQuestion;
        describe("Insert a new question", () => {
          it("doesn't reject", () => {
            return assert.doesNotReject(async () => {
              newQuestion = await db.insertQuestion(testQuestion);
            });
          });
          it("record has all required props", () => {
            assert.ok(
              Object.keys(newQuestion).every((key) =>
                questionProps.includes(key)
              ),
              `Unexpected prop found ${JSON.stringify(newQuestion)}`
            );
          });
          it("record count has increased by one", () => {
            return assert.doesNotReject(async () => {
              newCount = await db.numberOfRecords();
              assert.ok(
                newCount - recordCount === 1,
                `Old count: ${recordCount}; New count: ${newCount}`
              );
            });
          });
        });
        describe("Attempt to re-insert an existing question", () => {
          it("doesn't reject", () => {
            return assert.doesNotReject(async () => {
              duplicateQuestion = await db.insertQuestion(testQuestion);
            });
          });
          it("resolves to undefined", () => {
            assert.strictEqual(duplicateQuestion, undefined);
          });
          it("did not increase the count", () => {
            assert.doesNotReject(async () => {
              const postDuplicateCount = await db.numberOfRecords();
              assert.strictEqual(postDuplicateCount, newCount);
            });
          });
        });
        describe("Attempt to insert an invalid question", () => {
          let invalidQuestion;
          let postAttemptRecordCount = 0;
          it("rejects", () => {
            return assert.rejects(async () => {
              invalidQuestion = await db
                .insertQuestion({ question: NaN })
                .catch((e) => {
                  invalidQuestion = e;
                  throw e;
                });
            });
          });
          it("rejects with ERR_INVALID_ARG_TYPE error code", () => {
            assert.strictEqual(invalidQuestion.code, "ERR_INVALID_ARG_TYPE");
          });
          it("record count does not change", () => {
            return assert.doesNotReject(async () => {
              postAttemptRecordCount = await db.numberOfRecords();
              assert.strictEqual(postAttemptRecordCount, newCount);
            });
          });
        });
        describe("Attempt to insert an object with circular references (unserializable)", () => {
          // this triggers an error in the db.insert callback, for test coverage purposes.
          const circular = { a: true };
          circular.b = circular;
          let invalidQuestion;
          let postAttemptRecordCount = 0;
          it("rejects", () => {
            return assert.rejects(async () => {
              invalidQuestion = await db
                .insertQuestion({ question: "1", incorrect_answers: circular })
                .catch((e) => {
                  invalidQuestion = e;
                  throw e;
                });
            });
          });
          it("record count does not change", () => {
            return assert.doesNotReject(async () => {
              postAttemptRecordCount = await db.numberOfRecords();
              assert.strictEqual(postAttemptRecordCount, newCount);
            });
          });
        });
      }
    );
    describe(
      colorize.describeString("Function", {
        name: "db.removeQuestion",
        type: "function",
      }),
      () => {
        describe("Remove test question", () => {
          let recordsRemoved = 0;
          it("doesn't reject", () => {
            return assert.doesNotReject(async () => {
              recordsRemoved = await db.removeQuestion(newQuestion._id);
            });
          });
          it("indicates 1 record removed", () => {
            assert.strictEqual(recordsRemoved, 1);
          });
          it("number of records has returned to initial value", () => {
            let postRemovalCount = 0;
            assert.doesNotReject(async () => {
              postRemovalCount = await db.numberOfRecords();
              assert.strictEqual(postRemovalCount, recordCount);
            });
          });
        });
        describe("Attempt to remove invalid id", () => {
          it("rejects", () => {
            return assert.rejects(async () => {
              await db.removeQuestion("Invalid ID");
            });
          });
          it("record count does not change", () => {
            return assert.doesNotReject(async () => {
              postAttemptRecordCount = await db.numberOfRecords();
              assert.strictEqual(postAttemptRecordCount, recordCount);
            });
          });
        });
      }
    );
  });
};
