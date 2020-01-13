/*
  Handles checking if guess is correct and returns the next question or gameOver: true
*/

const validateIndex = (indexStr) => {
  // returns true if index is a number string between 0 and 3
  const index = parseInt(indexStr)
  return index > -1 && index < 4
}

// checks if session is in a valid state. ie. has questions, answers, currentQuestion value is valid and game isnt over
const validateSession = (sesh) => sesh.questions && sesh.answers && typeof sesh.currentQuestion === 'number' && sesh.currentQuestion >= 0 && !sesh.gameOver

const buildResponse = (sesh, correctAnswer) => {
  // returns the results of the guess and either a) the next question or b) gameOver: true if all questions have been answered
  const gameOver = sesh.currentQuestion > sesh.questions.length - 1
  const json = {
    success: true,
    results: {
      score: sesh.score,
      correctAnswer: correctAnswer,
    }
  }
  if (gameOver) {
    sesh.gameOver = true
    json.results.gameOver = true
  } else {
    json.results.questionData = {
      number: sesh.currentQuestion,
      question: sesh.questions[sesh.currentQuestion]
    }
  }
  return json
}

module.exports = (req, res) => {
  // verifies the current question's answer and returns the next question or gameOver: true
  const guess = req.body.guess
  if (validateIndex(guess)) {
    const sesh = req.session
    if (validateSession(sesh)) {
      const guessIndex = parseInt(guess)
      const correctAnswer = guessIndex === sesh.answers[sesh.currentQuestion].correctIndex
      if (correctAnswer) sesh.score++
      sesh.currentQuestion++
      const json = buildResponse(sesh, correctAnswer)
      res.json(json)
    } else {
      res.status(500).json({error: true, msg: 'nosession'})
    }
  } else {
    res.status(500).json({error: true, msg: 'invalidindex'})
  }
}

