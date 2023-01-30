import log from "./log.js";

export default function isDebug() {
  return process.argv.includes("--debug") || process.argv.includes("-d");
}
