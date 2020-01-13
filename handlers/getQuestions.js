/*
  Gets questions/answers from openTriviaDB, adds them to the session, and returns the first question
*/

const rp = require('request-promise')

const validateCategory = (str) => {
  // valid categories are number strings between 9 and 32 or 'any'
  let cond = false
  if (str === 'any') {
    cond = true
  } else {
    const number = parseInt(str)
    cond = number !== NaN && number > 8 && number < 33
  }
  return cond
}

// returns a random int between 0 and max
const getRandInt = (max) => Math.floor(Math.random() * (max + 1))

const answerToQuestion = (answerObject) => {
  // converts an answer object into a question object we can send to the client
  const q = Object.assign({}, answerObject)// break reference to answerObject
	q.possible_answers = [...q.incorrect_answers]
	q.possible_answers.splice(q.correctIndex, 0, q.correct_answer)// add the correct answer into the possible_answers array in a random position
  // remove the properties that reveal the answer
  delete q.incorrect_answers
  delete q.correct_answer
  delete q.correctIndex
	return q
}

module.exports = async (req, res) => {
  // gets questions, adds them to session and returns the first question in the response
  const category = req.body.category
  const session = req.session
  if (validateCategory(category)) {
    let url = 'https://opentdb.com/api.php?amount=10'
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
        // generate the questions for the client
        const questions = answers.map(a => answerToQuestion(a))
        // initialize the session store
        session.answers = answers
        session.questions = questions
        session.currentQuestion = 0
        session.score = 0
        session.gameOver = false;
        res.json({success: true, questionData: {number: 0, question: questions[0]}})
      } else {
        // opentrivia api response_code was not 0
        throw new Error('api error')
      }
    } catch (error) {
      res.status(500).json({error: true, msg: 'api error'})
    }    
  } else {
    res.status(500).json({error: true, msg: 'invalid category'})
  }
}

