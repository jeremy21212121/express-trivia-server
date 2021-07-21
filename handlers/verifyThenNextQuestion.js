/*
  Handles checking if guess is correct and returns the next question or gameOver: true
*/

const {
  getCorrectIndex,
  buildResponseAndAdvance,
} = require("../utils/verify");

module.exports = (req, res) => {
  // verifies the current question's answer and returns the next question or gameOver: true
  const guess = req.body.guess;
  const sesh = req.session;
  const correctIndex = getCorrectIndex(sesh);
  const isCorrectAnswer = correctIndex === Number(guess);
  
  if (isCorrectAnswer) {
    sesh.score++;
  }
  sesh.currentQuestion++;
  const json = buildResponseAndAdvance(sesh, isCorrectAnswer);
  res.json(json);
};
