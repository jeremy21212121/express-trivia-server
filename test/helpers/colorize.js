const chalk = require("chalk");

const colorize = (type, string) => {
  let output = string;
  switch (type) {
    case "function":
      output = chalk.yellow(string);
      break;
    case "object":
      output = chalk.blue(string);
      break;
    case "keyword":
      output = chalk.green(string);
      break;
    case "handler":
      output = chalk.bold.bgGrey(string);
      break;
    case "detail":
      output = chalk.grey(string);
      break;
    default:
      break;
  }
  return output;
};

colorize.describeString = (keyword, nameObj) => {
  let output = keyword ? colorize("keyword", keyword) : "";
  output += ` ${colorize(nameObj.type, nameObj.name)}`;
  return output;
};

module.exports = colorize;
