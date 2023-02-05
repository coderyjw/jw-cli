import Command from "@yejiwei/command";
import { Github } from "@yejiwei/utils";
class InstallCommand extends Command {
  get command() {
    return "install";
  }

  get description() {
    return "install project";
  }

  get options() {}

  async action(params) {
    const githubAPI = new Github();
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
