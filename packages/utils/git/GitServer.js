import { homedir } from "node:os";
import fs from "node:fs";
import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import { makePassword } from "../lib/inquirer.js";
import { log } from "../lib/index.js";
import { execa } from "execa";

const TEMP_HOME = ".jw-cli";
const TEMP_TOKEN = ".token";
const TEMP_PLATFORM = ".gitplatform";
function createTokenPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_TOKEN);
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
  constructor() {}

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

  getPlatform() {
    return getGitPlatform();
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
      return execa(
        "npm",
        ["install", "--registry=https://registry.npmmirror.com"],
        { cwd: projectPath }
      );
    }

    return null;
  }

  runRepo(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName);
    const pkg = getPackageJson(cwd, fullName);
    if (pkg) {
      const { scripts } = pkg;
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

export { getGitPlatform, GitServer };
