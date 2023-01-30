const Command = require("@yejiwei/command");

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
    console.log("init", name, opts);
  }

  preAction() {
    console.log("preAction");
  }

  postAction() {
    console.log("postAction");
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

module.exports = Init;