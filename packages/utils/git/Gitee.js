import axios from "axios";
import { GitServer } from "./GitServer.js";
import { log } from "../lib/index.js";

// token c96a2a8bea2a0c32697d6d73a1719792
const BASE_URL = "https://gitee.com/api/v5";
export default class Gitee extends GitServer {
  constructor() {
    super();
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });

    this.service.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }

  get(url, params, headers) {
    return this.service({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: "GET",
      headers,
    });
  }

  getRepo(owner, repo) {
    return this.get(`/repos/${owner}/${repo}`).catch((err) => {
      return null;
    });
  }

  post(url, data, headers) {
    return this.service({
      url,
      data,
      params: {
        access_token: this.token,
      },
      method: "post",
      headers,
    });
  }

  searchRepositories(params) {
    return this.get("search/repositories", params);
  }

  getTags(fullName) {
    return this.get(`/repos/${fullName}/tags`);
  }

  getRepoUrl(fullName) {
    return `https://gitee.com/${fullName}.git`;
  }

  getUser() {
    return this.get("/user");
  }

  getOrg() {
    return this.get("/user/orgs");
  }
  async createRepo(name) {
    // 检查远程仓库是否存在，如果存在，则跳过创建
    let repo = await this.getRepo(this.login, name);
    if (!repo) {
      log.info("仓库不存在，开始创建");
      if (this.own === "user") {
        repo = await this.post("/user/repos", { name });
      } else if (this.own === "org") {
        const url = "orgs/" + this.login + "/repos";
        repo = await this.post(url, { name });
      }

      if (repo?.id) {
        log.success("仓库创建成功");
      }
    } else {
      log.info("仓库存在，直接返回");
    }
    log.success("仓库地址", repo.html_url);
    return repo;
  }
}
