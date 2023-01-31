import path from "node:path";
import { homedir } from "node:os";
import { makeList, makeInput, getLatestVersion } from "@yejiwei/utils";
import { log } from "@yejiwei/utils";

const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";
const TEMP_HOME = ".jw-cli";

const ADD_TEMPLATE = [
  { name: "vue3 项目模板", value: "template-vue3", npmName: "@yejiwei/template-vue3", version: "1.0.1" },
  { name: "react18 项目模板", value: "template-react18", npmName: "@yejiwei/template-react18", vrrsion: "1.0.0" },
];

const ADD_TYPE = [
  { name: "项目", value: ADD_TYPE_PROJECT },
  { name: "页面", value: ADD_TYPE_PAGE },
];

// 获取常见类型
function getAddType() {
  return makeList({
    choices: ADD_TYPE,
    message: "请选择初始化类型",
    defaultValue: ADD_TYPE_PROJECT,
  });
}

// 获取项目名称
function getAddName() {
  return makeInput({
    message: "请输入项目的名称",
    defaultValue: "",
    validate(name) {
      if (name.length > 0) return true;
      return "项目名称不能为空";
    },
  });
}

// 选择项目模版
function getAddTemplate() {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择项目模版",
  });
}

// 安装缓存目录
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

export default async function createTemplate(name, opts) {
  const addType = await getAddType();
  log.verbose("addType", addType);
  let addName;
  if (addType === ADD_TYPE_PROJECT) {
    addName = await getAddName();
    log.verbose("addName", addName);
  }

  const addTemplate = await getAddTemplate();
  log.verbose("addTemplate", addTemplate);

  const selectedTemplate = ADD_TEMPLATE.find((_) => _.value === addTemplate);
  log.verbose("selectedTemplate", selectedTemplate);

  // 获取最新的版本
  const latestVersion = await getLatestVersion(selectedTemplate.npmName);
  log.verbose("latestVersion", latestVersion);
  selectedTemplate.version = latestVersion;

  const targetPath = makeTargetPath();
  log.verbose("targetPath", targetPath);

  return {
    type: addType,
    name: addName,
    template: selectedTemplate,
    targetPath,
  };
}
