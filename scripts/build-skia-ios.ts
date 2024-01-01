import { configurations } from "./skia-configuration";
import { executeCmd, executeCmdSync } from "./utils";

const configuration = configurations.ios;

let command = "";

Object.keys(configuration.targets).forEach((targetKey) => {
  command +=
    (command !== "" ? " && " : "") +
    `yarn ts-node ./scripts/build-skia.ts ios ${targetKey}`;
});

console.log("Building skia for iOS...");
executeCmd(command, "iOS", () => {
  console.log(`Done building skia for iOS.`);
});
