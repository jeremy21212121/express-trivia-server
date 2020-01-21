/*
  Gets the right quantity of question/answers from each category, adds questions/answers to the session and responds with the first question.

  The open trivia DB only supports single category requests, so multi-category is achieved with multiple http requests
*/

const validateCategories = require('../utils/categoryValidation')

// returns a random int between 0 and arg
const getRandInt = require('../utils/getRandomInt')

// converts an answer object into a question object we can send to the client
const answerToQuestion = require('../utils/answerObjectToQuestionObject')

// gets Q/A's from openTriviaDB
const getAnswers = require('../utils/getAnswers')

// route handler
const getQuestions = async (req, res) => {

  const categories = req.body.categories
  const session = req.session

  // holds the question / answer pairs for this section. We'll use this array for 1) generating the questions to send the client and 2) verifying the subsequent guesses on '/verify'
  const answersArray = []
  const questionsArray = []

  try {

    if (validateCategories(categories)) {
      // these help us determine the quantity of Q/As we need from each category
      // TODO: remove magic number 10
      const questionsPerCategory = Math.floor( 10 / categories.length)
      const remainder = 10 % categories.length

      // iterate over each category and get relevant question/answers from open trivia DB
      for (const [index, category] of categories.entries()) {
        // if last category in array and there is a remainder, add the remainder for the quantity
        let quantity = questionsPerCategory
        if (remainder && (index === categories.length - 1)) {
          quantity += remainder
        }
        // request an appropriate quantity of questions for this category
        const categoryAnswerArray = await getAnswers(category, quantity)

        // add this categories answers to the answersArray
        answersArray.push(...categoryAnswerArray)
      }

    } else {
      throw new Error('invalid-categories') // will be caught in catch block and result in a 500 respone + error message
    }
    // randomly shuffle answersArray.
    // TODO: evaluate if this should be done earlier
    answersArray.sort(() => getRandInt(2) - 1)
    // map answers to questions that can be sent to client
    questionsArray.push(...answersArray.map(answer => answerToQuestion(answer)))

    // initialize session
    session.answers = answersArray
    session.questions = questionsArray
    session.currentQuestion = 0
    session.score = 0
    session.gameOver = false;

    // success! send first question
    res.json({ success: true, questionData: {number: 0, question: questionsArray[0]} })

  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = getQuestions
