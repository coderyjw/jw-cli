import { Github, Gitee, makeList, log } from "../lib/index.js";
import { getGitOwn, getGitLogin } from "./GitServer.js";

export async function chooseGitPlatForm() {
  let platForm = await makeList({
    message: "请选择 Git 平台",
    choices: [
      {
        name: "Github",
        value: "github",
      },
      { name: "Gitee", value: "gitee" },
    ],
  });
  log.verbose("platForm", platForm);

  return platForm;
}

export async function initGitServer(platForm) {
  let gitAPI;
  if (platForm === "github") {
    gitAPI = new Github();
  } else if (platForm === "gitee") {
    gitAPI = new Gitee();
  }
  await gitAPI.init(platForm);
  return gitAPI;
}

export async function initGitType(gitAPI) {
  let gitOwn = getGitOwn(); // 仓库类型
  let gitLogin = getGitLogin(); // 仓库登录名

  if (!gitLogin && !gitOwn) {
    const user = await gitAPI.getUser();
    const org = await gitAPI.getOrg();
    log.verbose("user", user);
    log.verbose("org", org);

    if (!gitOwn) {
      gitOwn = await makeList({
        message: "请选择仓库类型",
        choices: [
          {
            name: "User",
            value: "user",
          },
          {
            name: "Organization",
            value: "org",
          },
        ],
      });
      log.verbose("gitOwn", gitOwn);
    }
    if (gitOwn === "user") {
      gitLogin = user?.login;
    } else {
      if (!org || !org?.length) {
        throw new Error("当前用户没有组织信息");
      } else {
        const orgList = org?.map((item) => ({
          name: item.name || item.login,
          value: item.login,
        }));
        gitLogin = await makeList({
          message: "请选择组织",
          choices: orgList,
        });
      }
    }
  }

  log.verbose("gitLogin", gitLogin);
  if (!gitLogin || !gitOwn) {
    throw new Error('未获取到用户的 Git 登录信息！请使用 "jw-cli commit --clear" 清除缓存后重试');
  }
  gitAPI.saveOwn(gitOwn);
  gitAPI.saveLogin(gitLogin);

  return gitLogin;
}
