import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import ora from "ora";

import { printErrorLog, log } from "@yejiwei/utils";

function getCacheDir(targetPath) {
  return path.resolve(targetPath, "node_modules");
}

function makeCacheDir(targetPath) {
  const cacheDir = getCacheDir(targetPath);
  if (!pathExistsSync(cacheDir)) {
    fse.mkdirpSync(cacheDir);
  }
}

export default function downloadTemplate(selectedTemplate) {
  const { targetPath, template } = selectedTemplate;
  makeCacheDir(targetPath);
  const spinner = ora("正在下载模版....").start();

  try {
    setTimeout(() => {
      spinner.stop();
      log.success("下载模版成功");
    }, 2000);
  } catch (e) {
    spinner.stop();
    printErrorLog(e);
  }
}
