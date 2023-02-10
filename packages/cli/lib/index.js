import { program } from "commander";
import createInitCommand from "@yejiwei/init";
import createCLI from "./createCLI.js";
import createInstall from "@yejiwei/install";
import createLintCommand from "@yejiwei/lint";
import createCommitCommand from "@yejiwei/commit";
import "./exception.js";

export default function (args) {
  createCLI(program);

  createInitCommand(program);

  createInstall(program);

  createLintCommand(program);

  createCommitCommand(program);

  program.parse(process.argv);
}
