const Datastore = require("nedb");
const { md5 } = require("./hash.js");
const categoriesArray = require("../db/categoriesArray.js");
const getRandomInt = require("./getRandomInt.js");

// Uses the test db when NODE_ENV === "test"
const dbPath = `${__dirname.replace("utils", "")}db/questions${
  process.env.NODE_ENV === "test" ? ".test" : ""
}.db`;
const db = new Datastore({
  filename: dbPath,
  autoload: true,
  corruptAlertThreshold: 0, // don't tolerate any data corruption
});
db.removeQuestion = (id) =>
  new Promise((resolve, reject) => {
    db.remove({ _id: id }, {}, (err, n) => {
      if (!err && n === 1) {
        resolve(n);
      } else {
        reject(err);
      }
    });
  });
db.insertQuestion = (questionObj) =>
  new Promise((resolve, reject) => {
    // break the reference to questionObj to ensure the object that was passed in is not mutated.
    // although, on second thought, it might be handy for the client to receive a unique id property for each question. Food for thought.
    const questionObjClone = Object.assign({}, questionObj);

    // set the id to a hash of the question text. This will (crudely) ensure we don't add the same question twice.
    questionObjClone._id = md5(questionObjClone.question);

    // insert the cloned question object into the db
    db.insert(questionObjClone, (err, newDoc) => {
      // ignore uniqueViolated errors, that just means we already have this question
      if (err && err.errorType !== "uniqueViolated") {
        reject(err);
      } else {
        resolve(newDoc);
      }
    });
  });

db.findAnswers = (query = { category: "any" }, limit = 10) =>
  new Promise(async (resolve, reject) => {

    if (query.category === "any") {
      query = {}
    } else {
      // map from api short category key to the category name we have in the database.
      // We should change this property on each item in the db and save a step.
      const dbCategoryDict = categoriesArray.find(
        (obj) => obj.key === query.category
      );
      if (!dbCategoryDict || !dbCategoryDict.apiName) {
        return reject(new Error("invalid-category"));
      }
      query.category = dbCategoryDict.apiName;
    }
    // instrumentation for timing db.numberOfRecords
    // const time1 = Date.now()

    // performance optimization
    // avoids counting all questions when no particular category is specified
    // hardcode the count to save ~100ms
    let count = 3558;
    if (query.category) {
      count = await db.numberOfRecords(query).catch((e) => reject(e));
    }
    // instrumentation for timing db.numberOfRecords
    // const timeForCount = Date.now() - time1
    // log time
    // console.log(timeForCount)

    // the difference between number of relevant records available and the quantity requested
    const diff = count - limit;
    let skip = 0;
    if (diff > 0) {
      // we have enough questions in the db to skip a random number between 0 and diff
      // this is the mechanism we use to make sure we don't return the same questions on consecutive games
      skip = getRandomInt(diff);
    }
    db.find(query)
      .skip(skip)
      .limit(limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });

db.numberOfRecords = (query = {}) =>
  new Promise((resolve, reject) => {
    db.count(query, (err, count) => {
      if (err) reject(err);
      resolve(count);
    });
  });

module.exports = { db };
