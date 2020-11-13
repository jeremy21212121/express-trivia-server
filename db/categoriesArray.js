/**
 *  Useful for translating between the category key (used by open trivia DB), SVG icon component name, our chosen display name and
 *  the display name used by the open trivia DB.
 *
 *  an (unsafe) illustrative example:
 *
 *    const keyToComponentName = (key) => categoriesArray.find(catObj => catObj.key === key).componentName
 *
 */

const categoriesArray = JSON.parse(
  '[{"componentName":"AnyIcon","displayName":"surprise me","key":"any","apiName":"Any Category"},{"componentName":"GeneralKnowledgeIcon","displayName":"general knowledge","key":"9","apiName":"General Knowledge"},{"componentName":"BooksIcon","displayName":"books","key":"10","apiName":"Entertainment: Books"},{"componentName":"FilmIcon","displayName":"films","key":"11","apiName":"Entertainment: Film"},{"componentName":"MusicIcon","displayName":"music","key":"12","apiName":"Entertainment: Music"},{"componentName":"MusicalsIcon","displayName":"theater & musicals","key":"13","apiName":"Entertainment: Musicals & Theatres"},{"componentName":"TelevisionIcon","displayName":"television","key":"14","apiName":"Entertainment: Television"},{"componentName":"VideogamesIcon","displayName":"video games","key":"15","apiName":"Entertainment: Video Games"},{"componentName":"BoardgamesIcon","displayName":"board games","key":"16","apiName":"Entertainment: Board Games"},{"componentName":"ScienceIcon","displayName":"science & nature","key":"17","apiName":"Science & Nature"},{"componentName":"ComputersIcon","displayName":"computers","key":"18","apiName":"Science: Computers"},{"componentName":"MathIcon","displayName":"math","key":"19","apiName":"Science: Mathematics"},{"componentName":"MythologyIcon","displayName":"mythology","key":"20","apiName":"Mythology"},{"componentName":"SportsIcon","displayName":"sports","key":"21","apiName":"Sports"},{"componentName":"GeographyIcon","displayName":"geography","key":"22","apiName":"Geography"},{"componentName":"HistoryIcon","displayName":"history","key":"23","apiName":"History"},{"componentName":"PoliticsIcon","displayName":"politics","key":"24","apiName":"Politics"},{"componentName":"ArtIcon","displayName":"art","key":"25","apiName":"Art"},{"componentName":"CelebritiesIcon","displayName":"celebrities","key":"26","apiName":"Celebrities"},{"componentName":"AnimalsIcon","displayName":"animals","key":"27","apiName":"Animals"},{"componentName":"VehiclesIcon","displayName":"vehicles","key":"28","apiName":"Vehicles"},{"componentName":"ComicsIcon","displayName":"comics","key":"29","apiName":"Entertainment: Comics"},{"componentName":"GadgetsIcon","displayName":"tech gadgets","key":"30","apiName":"Science: Gadgets"},{"componentName":"AnimeIcon","displayName":"anime & manga","key":"31","apiName":"Entertainment: Japanese Anime & Manga"},{"componentName":"CartoonsIcon","displayName":"cartoons & animation","key":"32","apiName":"Entertainment: Cartoon & Animations"}]'
);
categoriesArray.forEach((categoryObject) => {
  Object.freeze(categoryObject);
});
Object.freeze(categoriesArray);

module.exports = categoriesArray;
