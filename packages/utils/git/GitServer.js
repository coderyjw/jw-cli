import { homedir } from "node:os";
import fs from "node:fs";
import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import { makePassword, makeList } from "../lib/inquirer.js";
import { log } from "../lib/index.js";
import { execa } from "execa";

const TEMP_HOME = ".jw-cli";

const TEMP_GITHUB_TOEN = ".github-token";
const TEMP_GITEE_TOEN = ".gitee-token";

function createTokenPath(platForm) {
  if (platForm === "github") {
    return path.resolve(homedir(), TEMP_HOME, TEMP_GITHUB_TOEN);
  } else {
    return path.resolve(homedir(), TEMP_HOME, TEMP_GITEE_TOEN);
  }
}

function getProjectPath(cwd, fullName) {
  const projectName = fullName.split("/")[1]; // vuejs/vue => vue
  const projectPath = path.resolve(cwd, projectName);
  return projectPath;
}

function getPackageJson(cwd, fullName) {
  const projectPath = getProjectPath(cwd, fullName);
  const pkgPath = path.resolve(projectPath, "package.json");
  if (pathExistsSync(pkgPath)) {
    return fse.readJsonSync(pkgPath);
  } else {
    return null;
  }
}

export default class GitServer {
  constructor() {}

  async init(platForm) {
    // 判断 token 是否录入
    const tokenPath = createTokenPath(platForm);
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

  cloneRepo(fullName, tag) {
    if (tag) {
      return execa("git", ["clone", this.getRepoUrl(fullName), "-b", tag]);
    }
    return execa("git", ["clone", this.getRepoUrl(fullName)]);
  }

  installDependencies(cwd, fullName, tag) {
    const projectPath = getProjectPath(cwd, fullName);
    if (pathExistsSync(projectPath)) {
      return execa("npm", ["install", "--registry=https://registry.npmmirror.com"], { cwd: projectPath });
    }

    return null;
  }

  runRepo(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName);
    const pkg = getPackageJson(cwd, fullName);
    if (pkg) {
      const { scripts, bin } = pkg;

      if (bin) {
        execa("npm", ["run", "-g", name, "--registry=https://registry.npmmirror.com"], {
          cwd: projectPath,
          stdout: "inherit",
        });
      }

      if (scripts && scripts.dev) {
        return execa("npm", ["run", "dev"], {
          cwd: projectPath,
          stdout: "inherit",
        });
      } else if (scripts && scripts.serve) {
        return execa("npm", ["run", "serve"], {
          cwd: projectPath,
          stdout: "inherit",
        });
      } else if (scripts && scripts.start) {
        return execa("npm", ["run", "start"], {
          cwd: projectPath,
          stdout: "inherit",
        });
      } else {
        log.warn("未找到启动命令");
      }
    } else {
    }
  }
}

export { GitServer };
