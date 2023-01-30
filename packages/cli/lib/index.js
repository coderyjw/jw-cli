import path from "node:path";
import { program } from "commander";
import semver from "semver";
import chalk from "chalk";
import fse from "fs-extra";
import { log, isDebug } from "@yejiwei/utils";
import createInitCommand from "@yejiwei/init";
import { dirname } from "dirname-filename-esm";

const __dirname = dirname(import.meta);
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = fse.readJsonSync(pkgPath);
const LOWEST_NODE_VERSION = "17.0.0";

const checkNodeVersion = () => {
  log.verbose("node version", process.version);
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      chalk.red(`jw-cli 需要安装 ${LOWEST_NODE_VERSION} 以上版本的 Node.js`)
    );
  }
};

const preAction = () => {
  // 检查 Node 版本
  checkNodeVersion();
};

process.on("uncaughtException", (e) => {
  if (isDebug()) {
    console.log(e);
  } else {
    console.log(e.message);
  }
});

export default function (args) {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version, "-v, --version", "输出当前版本号")
    .option("-d, --debug", "是否开启调试模式", false)
    .helpOption("-h, --help", "命令显示帮助")
    .addHelpCommand("help [command]", "命令显示帮助")
    .hook("preAction", preAction);

  createInitCommand(program);

  program.parse(process.argv);
}
