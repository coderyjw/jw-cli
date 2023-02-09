import { ESLint } from "eslint";
import ora from "ora";
import { execa } from "execa";
import jest from "jest";
import path from "node:path";
import fs from "fs";
import fse from "fs-extra";

import { makeList } from "@yejiwei/utils";

import Command from "@yejiwei/command";
import { log, printErrorLog } from "@yejiwei/utils";
import vueConfig from "./eslint/vueConfig.js";

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
    log.verbose("lint");
    await this.eslint();
    await this.autoTest();
  }

  preAction() {
    // console.log("preAction");
  }

  postAction() {
    // console.log("postAction");
  }

  async eslint() {
    // 1. eslint
    // 准备工作，安装依赖
    const spinner = ora("正在安装依赖").start();
    try {
      await execa("npm", ["install", "-D", "eslint-plugin-vue", "--registry=https://registry.npmmirror.com"]);
      await execa("npm", ["install", "-D", "eslint-config-airbnb-base", "--registry=https://registry.npmmirror.com"]);
    } catch (e) {
      printErrorLog(e);
    } finally {
      spinner.stop();
    }
    log.info("正在执行eslint检查");
    // 执行工作，eslint
    const cwd = process.cwd();
    const eslint = new ESLint({
      cwd,
      overrideConfig: vueConfig,
    });
    const results = await eslint.lintFiles(["./src/**/*.js", "./src/**/*.vue"]);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
    const eslintResult = this.parseESLintResult(resultText);
    log.verbose("eslintResult", eslintResult);
    log.success("eslint检查完毕", "错误: " + eslintResult.errors, "，警告: " + eslintResult.warnings);
  }

  parseESLintResult(resultText) {
    const problems = this.extractESLint(resultText, "problems");
    const errors = this.extractESLint(resultText, "errors");
    const warnings = this.extractESLint(resultText, "warnings");
    return {
      problems: +problems || 0,
      errors: +errors || 0,
      warnings: +warnings || 0,
    };
  }

  extractESLint(resultText, type) {
    const problems = /[0-9]+ problems/;
    const warnings = /([0-9]+) warnings/;
    const errors = /([0-9]+) errors/;
    switch (type) {
      case "problems":
        return resultText.match(problems)[0].match(/[0-9]+/)[0];
      case "warnings":
        return resultText.match(warnings)[0].match(/[0-9]+/)[0];
      case "errors":
        return resultText.match(errors)[0].match(/[0-9]+/)[0];
      default:
        return null;
    }
  }

  async autoTest() {
    // 执行自动化测试之前，让用户选择采用哪种方法进行测试
    const cwd = process.cwd();
    let testMode;
    const jwConfigFile = path.resolve(cwd, ".jw-cli");
    let config;
    if (fs.existsSync(jwConfigFile)) {
      config = fse.readJsonSync(jwConfigFile);
      testMode = config.testMode;
      if (!testMode) {
        testMode = await makeList({
          message: "请选择自动化测试方法",
          choices: [
            { name: "jest", value: "jest" },
            { name: "mocha", value: "mocha" },
          ],
        });
        config.testMode = testMode;
        fse.writeJsonSync(jwConfigFile, config);
      }
    } else {
      testMode = await makeList({
        message: "请选择自动化测试方法",
        choices: [
          { name: "jest", value: "jest" },
          { name: "mocha", value: "mocha" },
        ],
      });
      fse.writeJsonSync(jwConfigFile, {
        testMode,
      });
    }
    if (testMode === "jest") {
      // 2. jest
      log.info("自动执行jest测试");
      await jest.run("test");
      log.success("jest测试执行完毕");
    } else {
      // 3. mocha
      log.info("自动执行mocha测试");
      const mochaInstance = new Mocha();
      mochaInstance.addFile(path.resolve(cwd, "__tests__/mocha_test.js"));
      mochaInstance.run(() => {
        log.success("mocha测试执行完毕");
      });
    }
  }
}

function Lint(instance) {
  return new LintCommand(instance);
}

export default Lint;
