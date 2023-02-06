import Command from "@yejiwei/command";
import { Github, Gitee, makeList, getGitPlatform, log, makeInput } from "@yejiwei/utils";
class InstallCommand extends Command {
  get command() {
    return "install";
  }

  get description() {
    return "install project";
  }

  get options() {}

  async action(params) {
    await this.generateGitAPI();

    await this.searchGitAPI();
  }

  async generateGitAPI() {
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

    if (platForm === "github") {
      this.gitAPI = new Github();
    } else if (platForm === "gitee") {
      this.gitAPI = new Gitee();
    }
    this.gitAPI.savePlatform(platForm);
    await this.gitAPI.init();
  }

  /* gitee 的参数 */
  // q: "vue+language:vue",
  // order: "desc",
  // language: "JavaScript",
  // sort: "stars_count",
  // per_page: 5,
  // page: 1,

  async searchGitAPI() {
    // 1. 收集搜索关键词和开发语言
    const q = await makeInput({
      message: "请输入搜索关键词",
      validate(value) {
        if (value) {
          return true;
        } else {
          return "请输入搜索关键词";
        }
      },
    });

    const language = await makeInput({
      message: "请输入开发语言",
    });

    log.verbose("search param：", q, language, this.gitAPI.getPlatform());

    // 2. 根据平台生成搜索参数
    const platform = this.gitAPI.getPlatform();
    this.page = 1;
    let params;
    if (platform === "github") {
      // https://api.github.com/search/repositories?q=vue%2Blanguage:vue&order=desc&sort=stars&per_page=5&page=1
      params = {
        q: q + (language ? `+language:${language}` : ""),
        order: "desc",
        sort: "stars",
        per_page: 5,
        page: this.page,
      };
    }

    const searchResult = await this.gitAPI.searchRepositories(params);
    log.verbose("searchResult", searchResult);
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
