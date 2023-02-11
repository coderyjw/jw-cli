import fse from "fs-extra";
import fs from "node:fs";
import path from "node:path";
import Command from "@yejiwei/command";
import { log } from "@yejiwei/utils";
import {
  chooseGitPlatForm,
  initGitServer,
  initGitType,
  createRemoteRepo,
} from "@yejiwei/utils";

class CommitCommand extends Command {
  get command() {
    return "commit";
  }

  get description() {
    return "代码提交器";
  }

  get options() {}

  async action(params) {
    // 1. 创建远程仓库
    await this.createRemoteRepo();
  }

  async createRemoteRepo() {
    // 1. 获取平台 platForm
    this.platForm = await chooseGitPlatForm();
    // 2. 实例化 Git 对象
    this.gitAPI = await initGitServer(this.platForm);

    // 3. 仓库类型选择
    await initGitType(this.gitAPI);

    // 4. 创建远程仓库
    // 获取项目名称
    const dir = process.cwd();
    const pkg = fse.readJsonSync(path.resolve(dir, "package.json"));
    this.name = pkg.name;
    await createRemoteRepo(this.gitAPI, this.name);

    // 5. 生成.gitignore
    const gitIgnorePath = path.resolve(dir, ".gitignore");
    if (!fs.existsSync(gitIgnorePath)) {
      log.info(".gitignore不存在，开始创建");
      fs.writeFileSync(
        gitIgnorePath,
        `.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
      );
      log.success(".gitignore创建成功");
    }
  }
}

function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
