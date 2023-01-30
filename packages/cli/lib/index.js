import { program } from "commander";
import { log, isDebug } from "@yejiwei/utils";
import createInitCommand from "@yejiwei/init";
import createCLI from "./createCLI.js";
import "./exception.js";

export default function (args) {
  createCLI(program);

  createInitCommand(program);

  program.parse(process.argv);
}
