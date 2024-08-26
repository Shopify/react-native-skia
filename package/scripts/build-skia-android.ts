import { configurations } from "./skia-configuration";
import { executeCmd } from "./utils";

const configuration = configurations.android;

console.log("Building skia for Android...");
let command = "";

Object.keys(configuration.targets).forEach((targetKey) => {
  command +=
    (command !== "" ? " && " : "") +
    `yarn ts-node ./scripts/build-skia.ts android ${targetKey}`;
});

executeCmd(command, "Android", () => {
  console.log(`Done building skia for Android.`);
});
