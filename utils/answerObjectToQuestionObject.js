/**
 *  Converts an 'answer' object that has the question and answer to a
 *  'question' object that can be sent to the client
 */

const answerToQuestion = (answerObject) => {
  // converts an answer object into a question object we can send to the client
  const q = Object.assign({}, answerObject);// break reference to answerObject
	q.possible_answers = [...q.incorrect_answers];
	q.possible_answers.splice(q.correctIndex, 0, q.correct_answer);// add the correct answer into the possible_answers array in a previously randomly generated position
  // remove the properties that reveal the answer
  delete q.incorrect_answers;
  delete q.correct_answer;
  delete q.correctIndex;
	return q;
}

module.exports = answerToQuestion;
