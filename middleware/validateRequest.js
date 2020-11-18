/**
 * Ensure requests have all the required props/values before passing them to the route handler
 */
const validateCategories = require("../utils/categoryValidation");
const { validateIndex, validateSession } = require("../utils/verify");

const validateBody = (req, prop, validatorFunction, errorString) => {
  const validProps =
    req.hasOwnProperty("body") && req.body.hasOwnProperty(prop);
  const validValues = validProps && validatorFunction(req.body[prop]);
  const maybeError = validValues ? undefined : new Error(errorString);
  return maybeError
}

const categories = (req, _res, next) => {
  next(validateBody(req, "categories", validateCategories, "invalid-categories"))
};
const guess = (req, _res, next) => {
  next(validateBody(req, "guess", validateIndex, "invalid-index"))
};
const session = (req, _res, next) => {
  const valid = req.session && validateSession(req.session)
  const maybeError = valid ? undefined : new Error("no-session")
  next(maybeError)
} 
const validateRequest = {
  categories,
  guess,
  session
};
module.exports = validateRequest;
