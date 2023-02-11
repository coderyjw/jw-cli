import fse from "fs-extra";
import fs, { stat } from "node:fs";
import path from "node:path";
import SimpleGit from "simple-git";
import semver from "semver";

import Command from "@yejiwei/command";
import { log, makeInput, makeList } from "@yejiwei/utils";
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
    // 2：git本地初始化
    await this.initLocal();
    // 3. 代码自动化提交
    await this.commit();
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
    this.version = pkg.version || "1.0.0";
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

  async initLocal() {
    // 生成 git remote 地址
    const remoteUrl = this.gitAPI.getRepoUrl(
      `${this.gitAPI.login}/${this.name}`
    );

    // 初始化git对象
    this.git = SimpleGit(process.cwd());
    // 判断当前项目是否进行git初始化
    const gitDir = path.resolve(process.cwd(), ".git");
    if (!fs.existsSync(gitDir)) {
      // 实现git初始化
      await this.git.init();
      log.success("完成git初始化");
    }

    // 获取所有的remotes
    const remotes = await this.git.getRemotes();
    if (!remotes.find((remote) => remote.name === "origin")) {
      this.git.addRemote("origin", remoteUrl);
      log.success("添加git remote", remoteUrl);

      const status = await this.git.status();
      // 检查未提交代码
      await this.checkNotCommitted();

      // 检查是否存在远程 master 分支
      const tags = await this.git.listRemote(["--refs"]);
      log.verbose("listRemote", tags);
      if (tags.indexOf("refs/heads/master") >= 0) {
        // 拉取远程master分支，实现代码同步
        await this.git.pull("origin", "master").catch((err) => {
          log.verbose("git pull origin master", err.message);
          if (err.message.indexOf("Couldn't find remote ref master") >= 0) {
            log.warn("获取远程[master]分支失败");
          }
        });
      } else {
        // 推送代码到远程 master 分支
        this.pushRemoteRepo("master");
      }
    }
  }

  async checkNotCommitted() {
    const status = await this.git.status();
    if (
      status.not_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.renamed.length > 0 ||
      status.modified.length > 0
    ) {
      log.verbose("status", status);
      await this.git.add(status.not_added);
      await this.git.add(status.created);
      await this.git.add(status.deleted);
      await this.git.add(status.renamed);
      await this.git.add(status.modified);

      let message;
      while (!message) {
        message = await makeInput({
          message: "请输入 commit 信息",
        });
      }

      await this.git.commit(message);
      log.success("本地 commit 提交成功");
    }
  }

  async pushRemoteRepo(branchName) {
    log.info(`推送代码至远程 ${branchName}`);
    await this.git.push("origin", branchName);
    log.success("推送代码成功");
  }

  async commit() {
    // 自动生成版本号
    await this.getCorrectVersion();
  }

  async getCorrectVersion() {
    log.info("获取代码分支");
    const remoteBranchList = await this.getRemoteBranchList("release");

    let releaseVersion = null;
    if (remoteBranchList && remoteBranchList.length > 0) {
      releaseVersion = remoteBranchList[0];
    }
    const devVersion = this.version;
    if (!releaseVersion) {
      this.branch = `dev/${devVersion}`;
    } else if (semver.gt(devVersion, releaseVersion)) {
      log.info(
        "当前本地版本号大于线上最新版本号",
        `${devVersion} > ${releaseVersion}`
      );
      this.branch = `dev/${devVersion}`;
    } else {
      log.info(
        "线上最新版本号大于当前本地版本号",
        `${releaseVersion} > ${devVersion}`
      );
      const incType = await makeList({
        message: "自动升级版本，请选择升级版本的类型",
        defaultValue: "patch",
        choices: [
          {
            name: `小版本（${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "patch"
            )}）`,
            value: "patch",
          },
          {
            name: `中版本（${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "minor"
            )}）`,
            value: "minor",
          },
          {
            name: `大版本（${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "major"
            )}）`,
            value: "major",
          },
        ],
      });
      const incVersion = semver.inc(releaseVersion, incType);
      this.branch = `dev/${incVersion}`;
      this.version = incVersion;
      this.syncVersionToPackageJson();
    }
    log.success(`代码分支获取成功 ${this.branch}`);
  }

  async getRemoteBranchList(type) {
    const remoteList = await this.git.listRemote(["--refs"]);
    let registerModule;
    let reg;
    if (type === "release") {
      // release 0.0.1
      reg = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g;
    } else {
      // dev 0.0.1
      reg = /.+?refs\/tags\/dev\/(\d+\.\d+\.\d+)/g;
    }

    return remoteList
      .split("\n")
      .map((remote) => {
        const match = reg.exec(remote);
        reg.lastIndex = 0;
        if (match && semver.valid(match[1])) {
          return match[1];
        }
      })
      .filter((_) => _)
      .sort((a, b) => {
        if (semver.lte(b, a)) {
          if (a === b) return 0;
          return -1;
        }
        return 1;
      });
  }

  async syncVersionToPackageJson() {
    const dir = process.cwd();
    const pkgPath = path.resolve(dir, "package.json");
    const pkg = fse.readJsonSync(pkgPath);

    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version;
      fse.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    }
  }
}

function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
