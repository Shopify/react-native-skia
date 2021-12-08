import {
  executeCmdSync,
  checkFileExists,
  ensureDistFolder,
  getDistFolder,
  backupAndCopyFile,
  restoreFile,
} from "./utils";
import fs from "fs";
import { exit } from "process";

const pck = JSON.parse(fs.readFileSync("./package/package.json").toString());

console.log("Building NPM package - version " + pck.version);
console.log("");

console.log("Checking prerequisites...");
// Check that Android is built
checkFileExists(
  "./package/android/build/outputs/aar/shopify_react-native-skia-release.aar",
  "Android Relase Package Built",
  "Have you forgotten to build the Android package? Run yarn build-android to build it."
);

checkFileExists(
  "./package/android/build/outputs/aar/shopify_react-native-skia-debug.aar",
  "Android Debug Package Built",
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
ensureDistFolder(getDistFolder());

// Replace the build.gradle file
backupAndCopyFile(
  "./package/android/build.gradle",
  "./npm/android/build.gradle"
);

// Back up and replace the Package file
backupAndCopyFile(
  "./package/android/src/main/java/com/shopify/reactnative/skia/RNSkiaPackage.java",
  "./npm/android/RNSkiaPackage.java"
);

// Create a temporary libs folder for android aar files
console.log("Copying aar files...");
const libsFolder = "./package/android/libs";
if (!fs.existsSync(libsFolder)) {
  fs.mkdirSync(libsFolder);
}

// Copy the build output file to the libs folder in the android folder
const androidBuildFolder = "./package/android/build/outputs/aar/";
fs.copyFileSync(
  androidBuildFolder + "shopify_react-native-skia-release.aar",
  libsFolder + "/shopify_react-native-skia-release.aar"
);

fs.copyFileSync(
  androidBuildFolder + "shopify_react-native-skia-debug.aar",
  libsFolder + "/shopify_react-native-skia-debug.aar"
);

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

// Clean up the aar library files
fs.unlinkSync(libsFolder + "/shopify_react-native-skia-release.aar");
fs.unlinkSync(libsFolder + "/shopify_react-native-skia-debug.aar");
fs.rmdirSync(libsFolder);

console.log("Restoring backup files...");
restoreFile("./package/android/build.gradle");
restoreFile(
  "./package/android/src/main/java/com/shopify/reactnative/skia/RNSkiaPackage.java"
);

// Done!
console.log("The output is in the `./dist` folder.");
exit(0);
