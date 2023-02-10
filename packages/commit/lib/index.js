import Command from "@yejiwei/command";
import { chooseGitPlatForm, initGitServer, initGitType } from "@yejiwei/utils";
class CommitCommand extends Command {
  get command() {
    return "commit";
  }

  get description() {
    return "代码提交器";
  }

  get options() {
  }

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
  }
}

function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
