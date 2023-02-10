import { GitServer } from "./GitServer.js";
import axios from "axios";

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

  post() {}

  searchRepositories(params) {
    return this.get("search/repositories", params);
  }

  getTags(fullName) {
    return this.get(`/repos/${fullName}/tags`);
  }

  getRepoUrl(fullName) {
    return `https://gitee.com/${fullName}.git`;
  }
}
