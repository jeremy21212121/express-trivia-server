/**
 * Contains various functions used by the /verify route handler
 */

 // checks that guess index is sane
const validateIndex = (indexStr) => {
  if (indexStr === null || indexStr === '') {
    return false
  }
  // returns true if indexStr is a number or number string between 0 and 3
  const index = Number(indexStr)
  return !Number.isNaN(index) && (index > -1 && index < 4)
}

// checks if session is in a valid state.
// ie. has questions, answers, currentQuestion value is valid and game isnt over
const validateSession = (sesh) => sesh.questions && sesh.answers && typeof sesh.currentQuestion === 'number' && sesh.currentQuestion >= 0 && !sesh.gameOver

// returns true if guess is correct
const evaluateGuess = (guess, sesh) => sesh && Number(guess) === sesh.answers[sesh.currentQuestion].correctIndex

const getCorrectIndex = (sesh) => sesh.answers[sesh.currentQuestion].correctIndex

// will result in a gameOver or provide the next question
const _advanceGame = (sesh, json, gameOver) => {
  if (gameOver) {
    sesh.gameOver = true
    json.results.gameOver = true
  } else {
    json.questionData = {
      number: sesh.currentQuestion,
      question: sesh.questions[sesh.currentQuestion]
    }
  }
}

// returns the results of the guess and either a) the next question or 
// b) results.gameOver === true if all questions have been answered
const buildResponseAndAdvance = (sesh, isCorrectGuess) => {
  const gameOver = sesh.currentQuestion > sesh.questions.length - 1
  const json = {
    success: true,
    results: {
      score: sesh.score,
      isCorrectGuess,
      // currentQuestion has already been incremented so we need to use currentQuestion - 1
      correctAnswer: sesh.answers[sesh.currentQuestion - 1].correct_answer
    }
  }
  _advanceGame(sesh, json, gameOver) // NB: this function call mutates sesh and/or json

  return json
}

module.exports = {
  getCorrectIndex,
  validateIndex,
  validateSession,
  evaluateGuess,
  buildResponseAndAdvance
 }
