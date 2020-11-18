/**
 * Ensures every valid category key is represented.
 * (categoriesArray allows mapping between a category key and name)
 *
 * This test ensures that categoriesArray.find will not return undefined
 * when a valid category key is specified. It also ensures the integrity of the data.
 */

const assert = require("assert").strict;
const colorize = require("../helpers/colorize.js");
const categoriesArray = require("../../db/categoriesArray.js");
const validCategories = require("../helpers/validCategories.js");
const categoryProperties = ["componentName", "displayName", "key", "apiName"];
// `array ${colorize(typeof categoriesArray, 'categoriesArray')}`
module.exports = () => {
  describe(colorize.describeString('Array', { name: 'categoriesArray', type: 'object' }), () => {
    describe("find each valid category object by key", () => {
      const categories = validCategories.map((key) =>
        categoriesArray.find((catObj) => catObj.key === key)
      );
      it("all defined", () => {
        const allDefined = categories.every((catObj, catIndex) => {
          const valid = catObj !== undefined;
          assert.ok(valid, `Category ${catIndex + 9} not found`);
          return valid;
        });
        assert.ok(
          allDefined,
          "One or more category objects undefined. Details should proceed this line."
        );
      });
      it("all have required properties", () => {
        const allProperties = categories.every((catObj, catIndex) => {
          const valid = categoryProperties.every((prop) => !!catObj[prop]);
          assert.ok(
            valid,
            `Category ${catIndex + 9} is missing ${Object.keys(catObj).find(
              (prop) => !categoryProperties.includes(prop)
            )} prop`
          );
          return valid;
        });
        assert.ok(
          allProperties,
          "One or more category objects is missing one or more properties. Details should proceed this line."
        );
      });
    });

    describe("find category object for 'any' category", () => {
      const catObj = categoriesArray.find((obj) => obj.key === "any");
      it("exists", () => {
        assert.ok(catObj !== undefined, "'any' category object not found");
      });
      it("has all required properties", () => {
        const valid = categoryProperties.every((prop) => !!catObj[prop]);
        assert.ok(
          valid,
          `Category 'any' is missing ${Object.keys(catObj).find(
            (prop) => !categoryProperties.includes(prop)
          )} prop`
        );
      });
    });
  });
};
