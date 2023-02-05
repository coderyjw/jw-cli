import Command from "@yejiwei/command";
import { Github, makeList, getGitPlatform, log } from "@yejiwei/utils";
class InstallCommand extends Command {
  get command() {
    return "install";
  }

  get description() {
    return "install project";
  }

  get options() {}

  async action(params) {
    let platForm = getGitPlatform();

    if (!platForm) {
      platForm = await makeList({
        message: "请选择 Git 平台",
        choices: [
          {
            name: "Github",
            value: "github",
          },
          { name: "Gitee", value: "gitee" },
        ],
      });
    }
    log.verbose("platform", platForm);

    let gitAPI;
    if (platForm === "github") {
      gitAPI = new Github();
    } else {
    }
    gitAPI.savePlatform(platForm);
    // await gitAPI.init();
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
