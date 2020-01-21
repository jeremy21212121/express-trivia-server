/*
  Returns a random int between 0 and max.
  
  There is a roughly equal probability for each int in the chosen range. I only verified this with max = 4 but it should hold true for other values, too. I mean, I wouldn't use it for crypto, but it is definitely adequate for randomizing multiple choice questions.

*/

const getRandInt = (max) => Math.floor(Math.random() * (max + 1));

module.exports = getRandInt;
