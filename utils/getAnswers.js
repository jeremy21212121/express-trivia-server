/**
 * Gets Q/A's from open trivia DB for the specified category and quantity
 * 
 */
const rp = require('request-promise')

const getRandInt = require('./getRandomInt.js')

const getAnswers = async (category, quantity) => {
  // TODO: Cache responses, store in DB.
  
  // build url
  let url = 'https://opentdb.com/api.php?amount=' + quantity
  if (category !== 'any') {
    // if the category is any, we can leave off the category param
    url += '&category=' + category
  }
  try {
    const response = await rp(url, {json: true})
    if (response.response_code === 0) {
      let answers = response.results.map(answerObject => {
        // generate an index for placing the correct answer and store it in the answer object for later verification
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
