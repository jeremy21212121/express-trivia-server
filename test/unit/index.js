
module.exports = () => {
  require('./getAnswers.js')()
  require('./categoriesArray.js')()
  require('./getQuestions.js')()
  require('./verify.js')()
  require('./verifyThenNextQuestion.js')()
  require('./db.js')()
}
