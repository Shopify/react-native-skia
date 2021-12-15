import { exit } from "process";
import { configurations } from "./skia-configuration";
import { executeCmdSync, checkFileExists } from "./utils";

/**
 * This build script builds the debug/release aar files for the android
 * version of the library.
 *
 * The prerequisites are:
 *
 * - NDK installed
 * - Prebuilt Skia binaries available
 * - Skia Headers copied
 *
 * The script does not take or use any parameters.
 *
 * NOTE: This script is not currently in use since we are
 * distributing the library with sources in the first versions.
 *
 */
console.log("Testing to see if everything is set up correctly...");
console.log("");
// Test for existence of Android SDK
if (!process.env.ANDROID_NDK) {
  console.log("ANDROID_NDK not set.");
  exit(1);
} else {
  console.log("☑ ANDROID_NDK");
}

// Test for prebuilt Skia binaries
configurations.android.outputMapping!.forEach((abi) => {
  ["libskia.a", "libskshaper.a", "libsvg.a"].forEach((lib) => {
    checkFileExists(
      `./package/libs/android/${abi}/${lib}`,
      `Skia Android ${abi}/${lib}`,
      "Have you built the Skia Android binaries? Run yarn run build-skia (it takes a while)"
    );
  });
});

// Test / make sure headers are copied
checkFileExists(
  "./package/cpp/skia/readme.txt",
  "Skia Headers Copied",
  "Have you copied the Skia headers? Run yarn run copy-skia-headers to copy the headers."
);

console.log("");

console.log("Building Android release/debug aar libraries...");
const currentDir = process.cwd();

console.log("Entering example/android");
process.chdir("./example/android");

const buildVariant = (variant: "Debug" | "Release") => {
  console.log(`Building ${variant}...`);
  executeCmdSync(`./gradlew :shopify_react-native-skia:assemble${variant}`);
  console.log(`Done building ${variant}.`);
};

console.log("Cleaning build folders ...");
executeCmdSync("./gradlew :shopify_react-native-skia:clean");

buildVariant("Debug");
buildVariant("Release");

process.chdir(currentDir);
