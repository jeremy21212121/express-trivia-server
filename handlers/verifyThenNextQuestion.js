/*
  Handles checking if guess is correct and returns the next question or gameOver: true
*/

const {
  validateIndex,
  validateSession,
  evaluateGuess,
  buildResponseAndAdvance,
} = require("../utils/verify");

module.exports = (req, res) => {
  // verifies the current question's answer and returns the next question or gameOver: true
  const guess = req.body.guess;
  if (validateIndex(guess)) {
    const sesh = req.session;
    if (validateSession(sesh)) {
      // const guessIndex = parseInt(guess)
      // const correctAnswer = guessIndex === sesh.answers[sesh.currentQuestion].correctIndex
      const correctAnswer = evaluateGuess(guess, sesh);
      if (correctAnswer) {
        sesh.score++;
      }
      sesh.currentQuestion++;
      const json = buildResponseAndAdvance(sesh, correctAnswer);
      res.json(json);
    } else {
      res.status(500).json({ error: true, msg: "no-session" });
    }
  } else {
    res.status(500).json({ error: true, msg: "invalid-index" });
  }
};
