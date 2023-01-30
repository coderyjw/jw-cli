const commander = require("commander");
const semver = require("semver");
const { log, isDebug } = require("@yejiwei/utils");
const createInitCommand = require("@yejiwei/init");

const pkg = require("../package.json");

const LOWEST_NODE_VERSION = "17.0.0";
const { program } = commander;

const checkNodeVersion = () => {
  log.verbose("node version", process.version);
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      `jw-cli 需要安装 ${LOWEST_NODE_VERSION} 以上版本的 Node.js`
    );
  }
};

const preAction = () => {
  // 检查 Node 版本
  checkNodeVersion();
};

process.on("uncaughtException", (e) => {
  if (isDebug()) {
    log.error(e);
  } else {
    log.error(e.message);
  }
});

module.exports = function (args) {
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
};
