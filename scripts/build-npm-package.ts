import { executeCmdSync, checkFileExists } from "./utils";
import fs from "fs";
import { exit } from "process";

const pck = JSON.parse(fs.readFileSync("./package/package.json").toString());

console.log("Building NPM package - version " + pck.version);
console.log("");

console.log("Checking prerequisites...");
// Check that Android is built
checkFileExists(
  "./package/android/build/outputs/aar/shopify_react-native-skia-release.aar",
  "Android Package Built",
  "Have you forgotten to build the Android package? Run yarn build-android to build it."
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

// Remove dist folder
if (fs.existsSync("./dist")) {
  console.log("Cleaning dist folder...");
  fs.rmdirSync("./dist", { recursive: true });
}
console.log("Creating dist folder");
fs.mkdirSync("./dist");

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
console.log(process.cwd());
fs.renameSync(packagePath, `./dist/${packageFilename}`);

// Done!
console.log("The output is in the `./dist` folder.");
exit(0);
