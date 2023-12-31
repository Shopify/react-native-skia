import { configurations } from "./skia-configuration";
import { executeCmd, executeCmdSync } from "./utils";

const configuration = configurations.ios;

let command = "";

Object.keys(configuration.targets).forEach((targetKey) => {
  command +=
    (command !== "" ? " && " : "") +
    `yarn ts-node ./scripts/build-skia.ts ios ${targetKey}`;
});

// Generate libgrapheme headers
const currentDir = process.cwd();
const libgraphemeDir = `${currentDir}/externals/skia/third_party/externals/libgrapheme`;

console.log("Generating libgrapheme headers...");
executeCmdSync(`cd ${libgraphemeDir} && ./configure && make`);
console.log("Building skia for iOS...");
executeCmd(command, "iOS", () => {
  console.log(`Done building skia for iOS.`);
});
