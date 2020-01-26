/**
 * Decodes any encoded html entities in the data from open trivia DB
 * 
 */
// const HtmlEntities = require("html-entities").AllHtmlEntities;
// const htmlEntities = new HtmlEntities();
const he = require('he')
const decodeHtmlEntities = he.decode;

const decodedCategoryAnswerArray = (categoryAnswerArray) => categoryAnswerArray.map(answer => {
  answer.question = decodeHtmlEntities(answer.question);
  answer.correct_answer = decodeHtmlEntities(answer.correct_answer);
  answer.incorrect_answers = answer.incorrect_answers.map(wrongAns =>
    decodeHtmlEntities(wrongAns)
  );
  return answer;
});

module.exports = decodedCategoryAnswerArray;