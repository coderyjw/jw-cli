import { program } from "commander";
import { log, isDebug } from "@yejiwei/utils";
import createInitCommand from "@yejiwei/init";
import createCLI from "./createCLI.js";

process.on("uncaughtException", (e) => {
  if (isDebug()) {
    console.log(e);
  } else {
    console.log(e.message);
  }
});

export default function (args) {
  createCLI(program);

  createInitCommand(program);

  program.parse(process.argv);
}
