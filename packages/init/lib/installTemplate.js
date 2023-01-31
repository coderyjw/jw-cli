import fse from "fs-extra";
import path from "node:path";
import ora from "ora";
import { pathExistsSync } from "path-exists";
import { log } from "@yejiwei/utils";

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
}

function copyFile(targetPath, template, installDir) {
  const originFilePath = getCacheFilePath(targetPath, template);
  log.verbose("originFilePath", originFilePath);
  const fileList = fse.readdirSync(originFilePath);
  log.verbose("fileList", fileList);
  const spinner = ora("正在拷贝文件...").start();
  fileList.map((file) => {
    fse.copySync(`${originFilePath}/${file}`, `${installDir}/${file}`);
  });
  spinner.stop();
  log.success("模版拷贝成功");
}

export default async function installTemplate(selectedTemplate, opts) {
  const { force = false } = opts;
  const { targetPath, template, name } = selectedTemplate;
  const rootDir = process.cwd();
  fse.ensureDirSync(targetPath);
  const installDir = path.resolve(`${rootDir}/${name}`);
  if (pathExistsSync(installDir)) {
    if (!force) {
      log.error(`当前目录已存在 ${installDir} 文件夹`);
      return;
    } else {
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }

  copyFile(targetPath, template, installDir);
}
