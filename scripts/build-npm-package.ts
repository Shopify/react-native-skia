import {
  executeCmdSync,
  checkFileExists,
  ensureFolderExists,
  getDistFolder,
} from "./utils";
import fs from "fs";
import { exit } from "process";
import { configurations } from "./skia-configuration";

const pck = JSON.parse(fs.readFileSync("./package/package.json").toString());

/**
 * This build script builds the final NPM package of the
 * @shopify/react-native-skia packages.
 *
 * The build script requires that we have valid Skia binaries
 * in the libs folder.
 *
 * The script requires a valid build number in the environment
 * varable GITHUB_RUN_NUMBER. The version of the package will
 * the version set in the package/package.json file, and will
 * use this as the build number.
 *
 */

console.log("Building NPM package");
console.log("");

console.log("Checking prerequisites...");

// test for valid build number
if (process.env.GITHUB_RUN_NUMBER === undefined) {
  console.log(
    "Failed. Expected a valid build number in the environment variable GITHUB_RUN_NUMBER"
  );
  process.exit(1);
}

// Check that Android Skia libs are built
configurations.android.outputMapping!.forEach((cpu) =>
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
ensureFolderExists(getDistFolder());

// Update version and save package.json
const majorMinor = pck.version.split(".").slice(0, 2).join(".");
const nextVersion = majorMinor + "." + process.env.GITHUB_RUN_NUMBER;
pck.version = nextVersion;
console.log("Building version:", nextVersion);

// Overwrite the package.json file
fs.writeFileSync("./package/package.json", JSON.stringify(pck, null, 2));

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
