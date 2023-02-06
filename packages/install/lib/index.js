import Command from "@yejiwei/command";
import { Github, Gitee, makeList, getGitPlatform, log, makeInput } from "@yejiwei/utils";

const PREV_PAGE = "prev_page";
const NEXT_PAGE = "next_page";
const SEARCH_MODE_REPO = "search_mode_repo";
const SEARCH_MODE_CODE = "search_mode_code";

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
    const platform = this.gitAPI.getPlatform();
    if (platform === "github") {
      this.mode = await makeList({
        message: "请选择搜索模式",
        choices: [
          { name: "仓库名称", value: SEARCH_MODE_REPO },
          { name: "源码", value: SEARCH_MODE_CODE },
        ],
      });
    }

    // 1. 收集搜索关键词和开发语言
    this.q = await makeInput({
      message: "请输入搜索关键词",
      validate(value) {
        if (value) {
          return true;
        } else {
          return "请输入搜索关键词";
        }
      },
    });

    this.language = await makeInput({
      message: "请输入开发语言",
    });

    this.keywords = this.q + (this.language ? `+language:${this.language}` : "");

    log.verbose("search keywords", this.keywords, platform);

    this.doSearch();
  }

  async doSearch() {
    // 2. 根据平台生成搜索参数
    const platform = this.gitAPI.getPlatform();
    this.page = 1;
    this.perPage = 10;
    let params;
    let count;
    let list;
    let searchResult;
    if (platform === "github") {
      // https://api.github.com/search/repositories?q=vue%2Blanguage:vue&order=desc&sort=stars&per_page=5&page=1
      params = {
        q: this.keywords,
        order: "desc",
        sort: "stars",
        per_page: this.perPage,
        page: this.page,
      };

      log.verbose("search params", params);
      if (this.mode === SEARCH_MODE_REPO) {
        searchResult = await this.gitAPI.searchRepositories(params);
        list = searchResult.map((item) => ({
          name: `${item.full_name}(${iten.description})`,
          value: item.full_name,
        }));
      } else if (this.mode === SEARCH_MODE_CODE) {
        searchResult = await this.gitAPI.searchCode(params);
        list = searchResult.map((item) => ({
          name: item.repository.full_name + (item.repository.description && `(${item.repository.description})`),
          value: item.repository.full_name,
        }));
      }
      log.verbose("searchResult", searchResult);

      count = searchResult.total_count; // 整体数据量

      // 判断当前页面，已经是否达到最大页数
      if (this.page * this.perPage < count) {
        list.push({
          name: "下一页",
          value: NEXT_PAGE,
        });
      } else if (this.page > 1) {
        list.unshift({
          name: "上一页",
          value: PREV_PAGE,
        });
      }

      const selected = await makeList({
        message: `请选择要下载的项目（共 ${count} 条数据）`,
        choices: list,
      });

      if (selected === NEXT_PAGE) {
        this.nextPage();
      } else if (selected === PREV_PAGE) {
        this.pervPage();
      }

      console.log(selected);
    }
  }

  async nextPage() {
    this.page++;
    await this.doSearch();
  }

  async prevPage() {
    this.page--;
    await this.doSearch();
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
