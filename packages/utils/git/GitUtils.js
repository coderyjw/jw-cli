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
