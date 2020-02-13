/**
 * Gets Q/A's from open trivia DB for the specified category and quantity
 * 
 */
//const rp = require('request-promise')
const { db } = require('./db.js')

const getRandInt = require('./getRandomInt.js')

const getAnswers = async (category, quantity) => {
  // Simulate response from api but actually get it from our cache.
  // This way little other code will need to be modified right now, but we get a massive speedup on multi-category calls to /start and much better scalability
  
  // build url
  // let url = 'https://opentdb.com/api.php?amount=' + quantity
  // if (category !== 'any') {
  //   // if the category is any, we can leave off the category param
  //   url += '&category=' + category
  // }
  try {
    // const response = await rp(url, {json: true})
    const response = { response_code: 1, results: [] }
    response.results = await db.findAnswers({ category }, quantity)
    // console.log(response.results)
    response.response_code = 0
    if (response.response_code === 0) {
      let answers = response.results.map(answerObject => {
        // generate an index for placing the correct answer and store it in the answer object for later verification
        // in the first version of cache, this propery erroneously already exists. this should overwrite it though.
        answerObject.correctIndex = getRandInt(answerObject.incorrect_answers.length)
        return answerObject
      })
      return answers
    } else {
      // opentrivia api response_code was not 0
      throw new Error('api-error')
    }
  } catch (error) {
    throw error
  }
}

module.exports = getAnswers
