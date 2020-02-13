const Datastore = require("nedb");
const { md5 } = require("./hash.js");
const categoriesArray = require('../db/categoriesArray.js')
const getRandomInt = require('./getRandomInt.js')

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

db.findAnswers = (query = { category: 'any' }, limit = 10) =>
  new Promise(async (resolve, reject) => {
    if (!query) { query = { category: 'any' } }
    if (!limit) { limit = 10 }
    if (query.category === 'any') {
      delete query.category
    } else {
      // map from api short category key to the category name we have in the database.
      // We should change this property on each item in the db and save a step.
      const dbCategoryDict = categoriesArray.find(obj => obj.key === query.category)
      if (!dbCategoryDict) { reject(new Error('invalid-category')) }
      query.category = dbCategoryDict.apiName
    }

    const time1 = Date.now()
    const count = await db.numberOfRecords(query).catch(e => reject(e))
    const timeForCount = Date.now() - time1
    const diff = count - limit
    let skip = 0
    if (diff > 0) {
      // we have enough questions in the db to skip a random number between 0 and diff
      skip = getRandomInt(diff)
    }
    db.find(query).skip(skip).limit(limit).exec((err, docs) => {
      if (err) { reject(err) }
      else { resolve(docs) }
    })
  })

db.numberOfRecords = (query = {}) =>
  new Promise((resolve, reject) => {
    if (!query) { query = {} } // not sure about support for default params in the odd version of node in prod
    db.count(query, (err, count) => {
      if (err) reject(err);
      resolve(count);
    });
  });

module.exports = { db };
