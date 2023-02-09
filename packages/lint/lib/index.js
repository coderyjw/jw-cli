import Command from "@yejiwei/command";
import { log } from "@yejiwei/utils";
import { ESLint } from "eslint";
class LintCommand extends Command {
  get command() {
    return "lint [name]";
  }

  get description() {
    return "代码规范自动化检查、自动化测试";
  }

  get options() {
    return [];
  }

  async action([name, opts]) {
    console.log("lint");
    // 1. eslint
    const eslint = new ESLint({ cwd: process.cwd() });
    const results = await eslint.lintFiles(["**/*.js"]);
    const formatter = await eslint.loadFormatter("stylish");

    const resultText = formatter.format(results);
    console.log(resultText);
    // 2. mocha
  }

  preAction() {
    // console.log("preAction");
  }

  postAction() {
    // console.log("postAction");
  }
}

function Lint(instance) {
  return new LintCommand(instance);
}

export default Lint;
