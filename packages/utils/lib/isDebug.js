const log = require("./log");

module.exports = function isDebug() {
  return process.argv.includes("--debug") || process.argv.includes("-d");
};