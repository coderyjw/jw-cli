import { makeList, makeInput } from "@yejiwei/utils";
import { log } from "@yejiwei/utils";

const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";

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
  });
}

// 选择项目模版
function getAddTemplate() {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择项目模版",
  });
}

export default async function createTemplate(name, opts) {
  const addType = await getAddType();
  log.verbose("addType", addType);

  if (addType === ADD_TYPE_PROJECT) {
    const addName = await getAddName();
    log.verbose("addName", addName);
  }

  const addTemplate = await getAddTemplate();
  log.verbose("addTemplate", addTemplate);

  const selectTemplate = ADD_TEMPLATE.find((_) => _.value === addTemplate);
  log.verbose("selectTemplate", selectTemplate);

  return {
    type: addType,
    name: addName,
    template: selectTemplate
  }
}
