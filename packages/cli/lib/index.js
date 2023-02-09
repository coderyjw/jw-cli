import { program } from "commander";
import createInitCommand from "@yejiwei/init";
import createCLI from "./createCLI.js";
import createInstall from "@yejiwei/install";
import createLintCommand from "@yejiwei/lint";
import "./exception.js";

export default function (args) {
  createCLI(program);

  createInitCommand(program);

  createInstall(program);

  createLintCommand(program);

  program.parse(process.argv);
}
