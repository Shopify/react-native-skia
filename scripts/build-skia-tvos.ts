import { configurations } from "./skia-configuration";
import { executeCmd } from "./utils";

const configuration = configurations.tvos;

console.log("Building skia for tvOS...");
let command = "";

Object.keys(configuration.targets).forEach((targetKey) => {
  command +=
    (command !== "" ? " && " : "") +
    `yarn ts-node ./scripts/build-skia.ts tvos ${targetKey}`;
});

executeCmd(command, "tvOS", () => {
  console.log(`Done building skia for tvOS.`);
});
