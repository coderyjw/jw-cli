import { homedir } from "node:os";
import fs from "node:fs";
import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import { makePassword } from "../lib/inquirer.js";
import { log } from "../lib/index.js";

const TEMP_HOME = ".jw-cli";
const TEMP_TOKEN = ".token";
const TEMP_PLATFORM = ".gitplatform";
function createTokenPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_TOKEN);
}

function createPlatformPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_PLATFORM);
}

function getGitPlatform() {
  if (pathExistsSync(createPlatformPath())) {
    return fs.readFileSync(createPlatformPath()).toString();
  }
  return null;
}
export default class GitServer {
  constructor() {
    this.init();
  }

  async init() {
    // 判断 token 是否录入
    const tokenPath = createTokenPath();
    if (pathExistsSync(tokenPath)) {
      this.token = fse.readFileSync(tokenPath).toString();
    } else {
      this.token = await this.getToken();
      fs.writeFileSync(tokenPath, this.token);
    }
    log.verbose("token", this.token);
  }

  async getToken() {
    return await makePassword({ message: "请输入 token 信息" });
  }

  savePlatform(platForm) {
    fs.writeFileSync(createPlatformPath(), platForm);
  }
}

export { getGitPlatform, GitServer };
