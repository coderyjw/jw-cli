import { Github, Gitee, makeList, log } from "../lib/index.js";

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
  const user = await gitAPI.getUser();
  const org = await gitAPI.getOrg();
  log.verbose("user", user);
  log.verbose("org", org);
}
