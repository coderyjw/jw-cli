import log from "./log.js";
import isDebug from "./isDebug.js";
import { makeList, makeInput, makePassword } from "./inquirer.js";
import getLatestVersion from "./npm.js";
import request from "./request.js";
import Github from "../git/Github.js";
import { getGitPlatform } from "../git/GitServer.js";

export function printErrorLog(e, type) {
  if (isDebug()) {
    log.error(type, e);
  } else {
    log.error(type, e.message);
  }
}

export {
  log,
  isDebug,
  makeList,
  makeInput,
  getLatestVersion,
  request,
  Github,
  getGitPlatform,
};
