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
}
