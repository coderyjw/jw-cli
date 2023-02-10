import { GitServer } from "./GitServer.js";
import axios from "axios";

import { log } from "../lib/index.js";

// token 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
const BASE_URL = "https://api.github.com";
export default class GitHub extends GitServer {
  constructor() {
    super();
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 60000,
    });

    this.service.interceptors.request.use(
      (config) => {
        config.headers["Authorization"] = `Bearer ${this.token}`;
        config.headers["Accept"] = "application/vnd.github+json";
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

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
      params,
      method: "GET",
      headers,
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

  searchCode(params) {
    return this.get("search/code", params);
  }

  getTags(fullName, params) {
    return this.get(`/repos/${fullName}/tags`, params);
  }

  getRepoUrl(fullName) {
    return `https://github.com/${fullName}.git`;
  }

  getUser() {
    return this.get("/user");
  }

  getOrg() {
    return this.get("/user/orgs");
  }

  getRepo(owner, repo) {
    return this.get(
      `/repos/${owner}/${repo}`,
      {},
      {
        accept: "application/vnd.github+json",
      }
    ).catch((err) => {
      return null;
    });
  }

  async createRepo(name) {
    // 检查远程仓库是否存在，如果存在，则跳过创建
    let repo = await this.getRepo(this.login, name);
    if (!repo) {
      log.info("仓库不存在，开始创建");
      if (this.own === "user") {
        repo = await this.post("/user/repos", { name }, { accept: "application/vnd.github+json" });
      } else if (this.own === "org") {
        const url = "orgs/" + this.login + "/repos";
        repo = await this.post(url, { name }, { accept: "application/vnd.github+json" });
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
