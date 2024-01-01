import { configurations } from "./skia-configuration";
import { executeCmd } from "./utils";

const configuration = configurations.ios;

console.log("Building skia for iOS...");
let command = "";

Object.keys(configuration.targets).forEach((targetKey) => {
  command +=
    (command !== "" ? " && " : "") +
    `yarn ts-node ./scripts/build-skia.ts ios ${targetKey}`;
});

executeCmd(command, "iOS", () => {
  console.log(`Done building skia for iOS.`);
});
