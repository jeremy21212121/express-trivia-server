/*
  Gets the right quantity of question/answers from each category, adds questions/answers to the session and responds with the first question.

  This used to call the OTDB API directly, but now we have cached them locally
*/

const validateCategories = require("../utils/categoryValidation");

// returns a random int between 0 and arg
const getRandInt = require("../utils/getRandomInt");

// converts an answer object into a question object we can send to the client
const answerToQuestion = require("../utils/answerObjectToQuestionObject");

// gets Q/A's from openTriviaDB
const getAnswers = require("../utils/getAnswers");

// decodes html entities in questions and answers to save the client having to decode them. Eg. "&gt;" becomes ">"
const decodeCategoryAnswerArray = require("../utils/decodeCategoryAnswerArray");

// for logging times for performance purposes
//perf const start = (name = "") => ({ time: Date.now(), name });
//perf const stop = (start) => console.log(`${start.name} ${Date.now() - start.time}ms`);

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

    if (categories.length > 10) {
      // more categories than questions
      // shuffle the categories and make length === 10
      categories.sort(() => getRandInt(2) - 1);
      categories.length = 10;
    }
    // The following helps us determine the quantity of Q/As we need from each category
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
      //perf const t = start('gQ getAnswers x1')
      const categoryAnswerArray = await getAnswers(category, quantity);
      //perf stop(t)
      const decodedCategoryAnswerArray = decodeCategoryAnswerArray(
        categoryAnswerArray
      );
      // add this categories answers to the answersArray
      answersArray.push(...decodedCategoryAnswerArray);
    }

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
