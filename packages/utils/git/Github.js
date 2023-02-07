import { GitServer } from "./GitServer.js";
import axios from "axios";

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

  post() {}

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
}
