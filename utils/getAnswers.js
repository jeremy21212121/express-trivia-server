/**
 * Gets Q/A's from open trivia DB for the specified category and quantity
 * 
 */

const { db } = require('./db.js')

const getRandInt = require('./getRandomInt.js')

const getAnswers = async (category, quantity) => {
  // Simulate response from api but actually get it from our cache.
  // This way little other code will need to be modified right now, but we get a massive speedup on multi-category calls to /start and much better scalability
  
  try {

    const results = await db.findAnswers({ category }, quantity)

    // generate an index for placing the correct answer and store it in the answer object for later verification
    const answers = results.map(answerObject => {
      // in the first version of cache, this propery erroneously already exists. the following will overwrite it though.
      answerObject.correctIndex = getRandInt(answerObject.incorrect_answers.length)

      return answerObject
    })

    return answers

  } catch (error) {
    throw error
  }
}

module.exports = getAnswers
