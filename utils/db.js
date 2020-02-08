const Datastore = require("nedb");
const { md5 } = require("./hash.js");

const db = new Datastore({
  filename: "/home/o/projects/trivia-backend/db/questions.db",
  autoload: true,
  corruptAlertThreshold: 0 // don't tolerate any data corruption
});

db.insertQuestion = questionObj =>
  new Promise((resolve, reject) => {
    // break the reference to questionObj to ensure the object that was passed in is not mutated.
    // although, on second thought, it might be handy for the client to receive a unique id property for each question. Food for thought.
    const questionObjClone = Object.assign({}, questionObj);

    // set the id to a hash of the question text. This will ensure we don't add the same question twice.
    questionObjClone._id = md5(questionObjClone.question);

    // insert the cloned question object into the db
    db.insert(questionObjClone, (err /**, newDoc */) => {
      // ignore uniqueViolated errors, that just means we already have this question
      if (err && err.errorType !== "uniqueViolated") {
        reject(err);
      } else {
        resolve();
      }
    });
  });

db.numberOfRecords = () =>
  new Promise((resolve, reject) => {
    db.find({}, (err, docs) => {
      if (err) reject(err);
      resolve(docs.length);
    });
  });

module.exports = { db };
