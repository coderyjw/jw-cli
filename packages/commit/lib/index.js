import Command from "@yejiwei/command";
import { chooseGitPlatForm, initGitServer } from "@yejiwei/utils";
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
    this.platForm = await chooseGitPlatForm();
    this.gitAPI = await initGitServer(this.platForm);
  }
}

function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
