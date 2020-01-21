/*
  Exported function returns true if argument is an array of valid category strings
*/

const validateCategories = arr => Array.isArray(arr) && arr.every(category => validateCategory(category));

const validateCategory = (str) => {
  // valid categories are number strings between 9 and 32 or 'any'
  const number = parseInt(str);
  let cond = !isNaN(number) && number > 8 && number < 33;

  if (str === 'any') {
    cond = true;
  }
  return cond;
}

module.exports = validateCategories;
