/*
  Gets the right quantity of question/answers from each category, adds questions/answers to the session and responds with the first question.

  Now featuring persistent caching of questions to a DB. Eventually we will be able to avoid calling the OTDB and improve performance significantly.

  The open trivia DB only supports single category requests, so multi-category is achieved with multiple http requests
*/

const validateCategories = require("../utils/categoryValidation");

// returns a random int between 0 and arg
const getRandInt = require("../utils/getRandomInt");

// converts an answer object into a question object we can send to the client
const answerToQuestion = require("../utils/answerObjectToQuestionObject");

// gets Q/A's from openTriviaDB
const getAnswers = require("../utils/getAnswers");

// decodes html entities in questions and answers to save the client having to decode them
const decodeCategoryAnswerArray = require("../utils/decodeCategoryAnswerArray");

const { db } = require("../utils/db.js");

// route handler
const getQuestions = async (req, res) => {
  const categories = req.body.categories;
  const session = req.session;

  // holds the question / answer pairs for this section. We'll use this array for 1) generating the questions to send the client and 2) verifying the subsequent guesses on '/verify'
  const answersArray = [];
  const questionsArray = [];

  // response payload and status
  const pendingResponse = { payload: { success: false }, status: 500 };

  try {
    if (validateCategories(categories)) {
      // these help us determine the quantity of Q/As we need from each category
      // TODO: remove magic number 10
      const questionsPerCategory = Math.floor(10 / categories.length);
      const remainder = 10 % categories.length;

      // iterate over each category and get relevant question/answers from open trivia DB
      for (const [index, category] of categories.entries()) {
        // if last category in array and there is a remainder, add the remainder for the quantity
        let quantity = questionsPerCategory;
        if (remainder && index === categories.length - 1) {
          quantity += remainder;
        }
        // request an appropriate quantity of questions for this category
        // console.log('getQuestions category, quantity passed to getAnswers', category, quantity)
        const categoryAnswerArray = await getAnswers(category, quantity);
        const decodedCategoryAnswerArray = decodeCategoryAnswerArray(
          categoryAnswerArray
        );
        // add this categories answers to the answersArray
        answersArray.push(...decodedCategoryAnswerArray);
      }
    } else {
      throw new Error("invalid-categories"); // will be caught in catch block and result in a 500 respone + error message
    }

    /**  We don't need this anymore, we have cached all the questions for now */
    // try to wait while inserting all our questions into the db.
    // It will not store duplicates, so we don't need to check.
    // try {
    //   await Promise.all(answersArray.map(qaObj =>
    //     db.insertQuestion(qaObj)
    //   ));
    //   // ensure data is persisted to disk
    //   // db.persistence.compactDatafile();
    //   db.numberOfRecords().then(n => console.log(`DB contains ${n} questions`))
    // } catch (error) {
    //   console.log(error)
    // }

    // randomly shuffle answersArray because they are currently grouped by category
    // I feel like it is more fun when the questions are shuffled.
    // If only a single category or "any" was selected this isn't needed, but it wont hurt.
    answersArray.sort(() => getRandInt(2) - 1);

    // map answers to questions that can be sent to client
    questionsArray.push(
      ...answersArray.map(answer => answerToQuestion(answer))
    );

    // initialize session
    session.answers = answersArray;
    session.questions = questionsArray;
    session.currentQuestion = 0;
    session.score = 0;
    session.gameOver = false;

    // success! set pendingResponse values and send first question
    pendingResponse.payload.success = true;
    pendingResponse.status = 200;
    pendingResponse.payload.questionData = {
      number: 0,
      question: questionsArray[0]
    };
  } catch (error) {
    // ensure response values are properly set for error
    pendingResponse.payload.success = false;
    pendingResponse.status = 500;
    pendingResponse.error = error.message;
    console.error(error);
  }
  res.status(pendingResponse.status).json(pendingResponse.payload);
};

module.exports = getQuestions;
