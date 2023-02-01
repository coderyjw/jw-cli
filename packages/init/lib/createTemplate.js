import path from "node:path";
import { homedir } from "node:os";
import {
  makeList,
  makeInput,
  getLatestVersion,
  request,
  printErrorLog,
} from "@yejiwei/utils";
import { log } from "@yejiwei/utils";

const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";
const TEMP_HOME = ".jw-cli";

const ADD_TYPE = [
  { name: "项目", value: ADD_TYPE_PROJECT },
  { name: "页面", value: ADD_TYPE_PAGE },
];

const GLOBAL_ADD_TEMPLATE = [
  {
    name: "vue3 项目模板",
    value: "template-vue3",
    npmName: "@yejiwei/template-vue3",
    version: "1.0.1",
  },
  {
    name: "react18 项目模板",
    value: "template-react18",
    npmName: "@yejiwei/template-react18",
    version: "1.0.0",
  },
  {
    name: "vue-element-admin 项目模板",
    value: "template-vue-element-admin",
    npmName: "@yejiwei/template-vue-element-admin",
    version: "1.0.0",
  },
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
function getAddTemplate(ADD_TEMPLATE) {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择项目模版",
  });
}

// 安装缓存目录
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

// 通过 API 获取项目模板
async function getTemplateFromAPI() {
  try {
    const data = await request({
      url: "/project/template",
      method: "get",
    });
    console.log(data);
    return data;
  } catch (e) {
    printErrorLog(e);
    return null;
  }
}

export default async function createTemplate(name, opts) {
  let ADD_TEMPLATE;
  // ADD_TEMPLATE = await getTemplateFromAPI();
  ADD_TEMPLATE = GLOBAL_ADD_TEMPLATE;

  const { type, template } = opts;
  // 项目类型，项目名称，项目模版
  let addType, addName, addTemplate;
  if (type) {
    addType = type;
  } else {
    addType = await getAddType();
  }

  log.verbose("addType", addType);
  if (addType === ADD_TYPE_PROJECT) {
    if (name) {
      addName = name;
    } else {
      addName = await getAddName();
    }
    log.verbose("addName", addName);

    if (template) {
      addTemplate = template;
    } else {
      addTemplate = await getAddTemplate(ADD_TEMPLATE);
    }
    log.verbose("addTemplate", addTemplate);

    const selectedTemplate = ADD_TEMPLATE.find((_) => _.value === addTemplate);
    if (!selectedTemplate) throw new Error(`项目模版 ${template} 不存在！`);
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
  } else {
    throw newError(`创建的项目类型 ${addType} 不支持！`);
  }
}
