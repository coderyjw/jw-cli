import { GitServer } from "./GitServer.js";
import axios from "axios";

// token acc84536768f570145d1f2f13747196f
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
}
