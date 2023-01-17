#!/usr/bin/env node

const importLocal = require("import-local");
const log = require("npmlog");
const entry = require("../lib/index");

console.log("process.argv:", process.argv);
if (importLocal(__filename)) {
  log.info("cli", "使用本次 jw-cli 版本");
} else {
  entry(process.argv.slice(2));
}
