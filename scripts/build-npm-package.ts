import {
  executeCmdSync,
  checkFileExists,
  ensureDistFolder,
  getDistFolder,
} from "./utils";
import fs from "fs";
import { exit } from "process";

const pck = JSON.parse(fs.readFileSync("./package/package.json").toString());

console.log("Building NPM package - version " + pck.version);
console.log("");

console.log("Checking prerequisites...");

// Check that Android Skia libs are built
["armeabi-v7a", "arm64-v8a", "x86", "x86_64"].forEach((cpu) =>
  ["libskia.a", "libskshaper.a", "libsvg.a"].forEach((lib) => {
    checkFileExists(
      `./package/libs/android/${cpu}/${lib}`,
      `Skia Android ${cpu}/${lib}`,
      "Have you built the Skia Android binaries? Run yarn run build."
    );
  })
);

// Check that iOS Skia libs are built
["libskia.a", "libskshaper.a", "libsvg.a"].forEach((lib) => {
  checkFileExists(
    `./package/libs/ios/${lib}`,
    `Skia iOS ${lib}`,
    "Have you built the Skia iOS binaries? Run yarn run build."
  );
});

console.log("Prerequisites verified successfully.");
ensureDistFolder(getDistFolder());

// Now let's start to build it
const currentDir = process.cwd();
console.log("Entering directory `package`");
process.chdir("./package");
console.log("Running `npm pack` in package folder", process.cwd());
executeCmdSync("npm pack");
process.chdir(currentDir);

console.log("Done building NPM package");

// Copy package to the dist folder
const packageFilename = `shopify-react-native-skia-${pck.version}.tgz`;
const packagePath = `./package/${packageFilename}`;
fs.renameSync(packagePath, `${getDistFolder()}/${packageFilename}`);

// Done!
console.log("The output is in the `./dist` folder.");
exit(0);
