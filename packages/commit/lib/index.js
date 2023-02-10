import Command from "@yejiwei/command";

class CommitCommand extends Command {
  get command() {
    return "commit";
  }

  get description() {
    return "代码提交器";
  }

  get options() {}

  async action(params) {
    console.log("commit");
  }
}

function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
