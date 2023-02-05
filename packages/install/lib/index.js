import Command from "@yejiwei/command";
import { Github, Gitee, makeList, getGitPlatform, log } from "@yejiwei/utils";
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
      gitAPI = new Gitee();
    }
    gitAPI.savePlatform(platForm);
    await gitAPI.init();

    const searchResult = await gitAPI.searchRepositories({
      q: "vue+language:vue",
      order: "desc",
      language: "JavaScript",
      // sort: "stars",
      sort: "stars_count",
      per_page: 5,
      page: 1,
    });
    console.log({ searchResult });
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
