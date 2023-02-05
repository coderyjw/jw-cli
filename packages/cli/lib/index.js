import { program } from "commander";
import { log, isDebug } from "@yejiwei/utils";
import createInitCommand from "@yejiwei/init";
import createCLI from "./createCLI.js";
import createInstall from "@yejiwei/install";
import "./exception.js";

export default function (args) {
  createCLI(program);

  createInitCommand(program);

  createInstall(program);

  program.parse(process.argv);
}
