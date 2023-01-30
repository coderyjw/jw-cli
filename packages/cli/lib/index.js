const commander = require("commander");
const createInitCommand = require("@yejiwei/init");

const { program } = commander;
const pkg = require("../package.json");
module.exports = function (args) {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version, "-v, --version", "输出当前版本号")
    .option("-d, --debug", "是否开启调试模式", false)
    .helpOption("-h, --help", "命令显示帮助")
    .addHelpCommand("help [command]", "命令显示帮助");

  createInitCommand(program);

  program.parse(process.argv);
};
