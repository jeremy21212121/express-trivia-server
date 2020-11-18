/**
 * Ensure requests have all the required props/values before passing them to the route handler
 */
const validateCategories = require("../utils/categoryValidation");
const getQuestions = (req, _res, next) => {
  const validProps =
    req.hasOwnProperty("body") && req.body.hasOwnProperty("categories");
  const validValues = validProps && validateCategories(req.body.categories);
  const maybeError = validValues ? undefined : new Error("invalid-categories");
  next(maybeError);
};
const validateRequest = {
  getQuestions,
};
module.exports = validateRequest;
