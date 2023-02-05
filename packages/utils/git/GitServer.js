import { homedir } from "node:os";
import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import { makePassword } from "../lib/inquirer.js";

const TEMP_HOME = ".jw-cli";
const TEMP_TOKEN = ".token";

function createTokenPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_TOKEN);
}

export default class GitServer {
  constructor() {
    // 判断 token 是否录入
    const tokenPath = createTokenPath();
    console.log(tokenPath);
    if (pathExistsSync(tokenPath)) {
      this.token = fse.readFileSync(tokenPath);
      console.log(this.token);
    } else {
      this.getToken().then((token) => {
        this.token = token;
        console.log(this.token);
      });
    }
  }

  async getToken() {
    return makePassword({ message: "请输入 token 信息" });
  }
}
