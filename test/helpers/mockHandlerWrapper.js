/**
 *  For testing route handlers. I wrote my own for fun and education.
 */
// string[] of valid category IDs
const validCategories = require("../helpers/validCategories.js");
// string[][] of valid category IDs. Non-deterministic, will be different each run.
const sampleOfValidMultiCategoryArrays = require("../helpers/sampleValidMultiCatArrays.js");
// used for generating request objects for testing /verify route handler
const getQuestions = require("../../handlers/getQuestions.js");
/**
 * Creates a mock request object for testing route handlers
 * @param {object} body - Array of category ID strings
 * @returns {object} - Mock request object
 */
const mockRequest = (body) => ({
  body,
  session: {},
});

/**
 * Test wrapper for route handlers. Rejects if next is called with anything other than undefined.
 * This wrapper allows calling route handlers
 * @param {function} handler - async route handler
 * @param {object} mockReq - Mock request object with all required properties
 * @returns {object} - .status and .payload
 */
const mockHandlerRunner = (handler, mockReq) =>
  new Promise(async (resolve, reject) => {
    // console.log(mockReq)
    const mockResponse = {
      status: (status) => ({
        json: (obj) => resolve({ status, payload: obj }),
      }),
      json: (obj) => resolve({ status: 200, payload: obj }),
    };

    const mockNext = (maybeError) => {
      if (maybeError !== undefined) {
        reject(maybeError);
      } else {
        resolve(true);
      }
    };
    // this promise is resolved or rejected in the handler function
    await handler(mockReq, mockResponse, mockNext);
    // return response;
  });

// used for generating mock request objects for passing to /verifyThenNext handler
// we need the /start handler to mutate the session object so it is in a valid state
// for calling our intended route handler
const generateMockRequestObjectsForVTNQRouteHandler = {
  singleCategories: async () =>
    await Promise.all(
      validCategories.map(async (cat) => {
        const mockReq = mockRequest({ categories: [cat] });
        // mutate mockReq by passing it to route handler. This will add the session state required for calling VTNQ handler.
        await mockHandlerRunner(getQuestions, mockReq);
        return mockReq;
      })
    ),
  // non-deterministic sampling of valid categories
  multipleCategories: async () =>
    await Promise.all(
      sampleOfValidMultiCategoryArrays.map(async (catArray) => {
        const mockReq = mockRequest({ categories: catArray });
        await mockHandlerRunner(getQuestions, mockReq);
        return mockReq;
      })
    ),
};

module.exports = {
  mockRequest,
  mockHandlerRunner,
  generateMockRequestObjectsForVTNQRouteHandler,
};
