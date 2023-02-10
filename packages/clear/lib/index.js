import Command from "@yejiwei/command";
import { makeList, clearAllCache, clearTokenCache, log } from "@yejiwei/utils";
class ClearCommand extends Command {
  get command() {
    return "clear";
  }

  get description() {
    return "清除缓存";
  }

  get options() {}

  async action() {
    const clearTarget = await makeList({
      message: "请选择要清除的缓存",
      choices: [
        { name: "token 缓存", value: "token" },
        { name: "所有缓存", value: "all" },
      ],
    });
    if (clearAllCache === "token") {
      clearTokenCache();
    } else {
      clearAllCache();
    }
    log.success("缓存清除成功");
  }
}

function Clear(instance) {
  return new ClearCommand(instance);
}

export default Clear;
