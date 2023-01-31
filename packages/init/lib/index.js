import Command from "@yejiwei/command";
import { log } from "@yejiwei/utils";
import createTemplate from "./createTemplate.js";
import downloadTemplate from "./downloadTemplate.js";
import installTemplate from "./installTemplate.js";
class InitCommand extends Command {
  get command() {
    return "init [name]";
  }

  get description() {
    return "项目初始化";
  }

  get options() {
    return [
      ["-f, --force", "是否强制更新", false],
      ["-t, --type <type>", "项目类型(project/page)"],
      ["-tp, --template <template>", "模版名称"],
    ];
  }

  async action([name, opts]) {
    // log.verbose("init", name, opts);
    // 1. 选择项目模板，生成项目信息
    const selectedTemplate = await createTemplate(name, opts);
    log.verbose("template", selectedTemplate.template);
    // 2. 下载项目模板值缓存目录
    await downloadTemplate(selectedTemplate);
    // 3. 安装项目模板至目录
    await installTemplate(selectedTemplate, opts);
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
