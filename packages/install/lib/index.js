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

    log.verbose("selectedProject", this.selectedProject);
    log.verbose("selectedTag", this.selectedTag);

    await this.downloadRepo();
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

    this.page = 1;
    this.perPage = 10;

    await this.doSearch();

    await this.selectTags();
  }

  async doSearch() {
    // 2. 根据平台生成搜索参数
    const platform = this.gitAPI.getPlatform();

    let params;
    let count = 0;
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
          name: `${item.full_name}（${item.description}）`,
          value: item.full_name,
        }));
      } else if (this.mode === SEARCH_MODE_CODE) {
        searchResult = await this.gitAPI.searchCode(params);
        list = searchResult.map((item) => ({
          name: item.repository.full_name + (item.repository.description && `（${item.repository.description}）`),
          value: item.repository.full_name,
        }));
      }
      // log.verbose("searchResult", searchResult);

      count = searchResult.total_count; // 整体数据量
    } else if (platform === "gitee") {
      params = {
        q: this.q,
        order: "desc",
        sort: "stars_count",
        per_page: this.perPage,
        page: this.page,
      };
      if (this.language) {
        params.language = this.language; // 注意输入格式: JavaScript
      }
      log.verbose("search params", params);

      searchResult = await this.gitAPI.searchRepositories(params);
      // log.verbose("searchResult", searchResult);

      count = 99999;

      list = searchResult.map((item) => ({
        name: `${item.full_name}（${item.description}）`,
        value: item.full_name,
      }));
    }
    // 判断当前页面，已经是否达到最大页数
    if ((platform === "github" && this.page * this.perPage < count) || (platform === "gitee" && list?.length > 0)) {
      list.push({
        name: "下一页",
        value: NEXT_PAGE,
      });
    }

    if (this.page > 1) {
      list.unshift({
        name: "上一页",
        value: PREV_PAGE,
      });
    }

    if (count > 0) {
      const selectedProject = await makeList({
        message: platform === "github" ? `请选择要下载的项目（共 ${count} 条数据）` : "请选择要下载的项目",
        choices: list,
      });

      if (selectedProject === NEXT_PAGE) {
        this.nextPage();
      } else if (selectedProject === PREV_PAGE) {
        this.prevPage();
      } else {
        // 下载项目
        this.selectedProject = selectedProject;
      }
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

  async selectTags() {
    this.tagPage = 1;
    this.tagPerPage = 100;

    const tagList = await this.doSelectTags();

    if (tagList.length > 0) {
      tagList.push({
        name: "下一页",
        value: NEXT_PAGE,
      });
    }

    if (this.page > 1) {
      tagList.unshift({
        name: "上一页",
        value: PREV_PAGE,
      });
    }

    const tagChoicesList = tagList.map((item) => ({
      name: item.name,
      value: item.name,
    }));

    const selectedTag = await makeList({
      message: "请选择 tag",
      choices: tagChoicesList,
    });

    if (selectedTag === PREV_PAGE) {
      this.prevPage();
    } else if (selectedTag === NEXT_PAGE) {
      this.nextPage();
    } else {
      // 下载源码
      this.selectedTag = selectedTag;
    }
  }

  async doSelectTags() {
    const params = { page: this.tagPage, per_page: this.tagPerPage };
    const tagList = await this.gitAPI.getTags(this.selectedProject, params);

    // log.verbose("tagList", tagList);
    return tagList;
  }

  async prevTags() {
    this.tagPage--;
    this.doSelectTags();
  }

  async nextTags() {
    this.tagPage++;
    this.doSelectTags();
  }

  async downloadRepo() {
    await this.gitAPI.cloneRepo(this.selectedProject, this.selectedTag);
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
