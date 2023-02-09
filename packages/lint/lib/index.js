import Command from "@yejiwei/command";
import { log } from "@yejiwei/utils";

class LintCommand extends Command {
  get command() {
    return "lint [name]";
  }

  get description() {
    return "lint";
  }

  get options() {
    return [];
  }

  async action([name, opts]) {
    console.log("lint");
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
