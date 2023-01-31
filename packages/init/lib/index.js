import Command from "@yejiwei/command";
import { log } from "@yejiwei/utils";
import createTemplate from "./createTemplate.js";
class InitCommand extends Command {
  get command() {
    return "init [name]";
  }

  get description() {
    return "项目初始化";
  }

  get options() {
    return [["-f,--force", "是否强制更新", false]];
  }

  action([name, opts]) {
    // log.verbose("init", name, opts);
    // 1. 选择项目模板，生成项目信息
    createTemplate(name, opts);
    // 2. 下载项目模板值缓存目录
    // 3. 安装项目模板至目录
  }

  preAction() {
    // console.log("preAction");
  }

  postAction() {
    // console.log("postAction");
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

export default Init;
