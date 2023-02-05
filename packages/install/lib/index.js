import Command from "@yejiwei/command";

class InstallCommand extends Command {
  get command() {
    return "install";
  }

  get description() {
    return "install project";
  }

  get options() {}

  async action(params) {
    console.log({ params });
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
