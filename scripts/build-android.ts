import { exit } from "process";
import { executeCmdSync } from "./utils";
const fs = require("fs");

const checkFileExists = (filePath: string, message: string, error: string) => {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    console.log("");
    console.log("Failed:");
    console.log(message + " not found. (" + filePath + ")");
    console.log(error);
    console.log("");
    exit(1);
  } else {
    console.log("☑ " + message);
  }
};

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
["arm64-v8a", "armeabi-v7a", "x86", "x86_64"].forEach((abi) => {
  ["libskia.a", "libskshaper.a", "libsvg.a"].forEach((lib) => {
    checkFileExists(
      `./package/libs/android/${abi}/${lib}`,
      `Skia ${abi}/${lib}`,
      "Have you built the Skia Android binaries? Run yarn run build"
    );
  });
});

// Test / make sure headers are copied
checkFileExists(
  "./package/cpp/skia/readme.txt",
  "Skia Headers Copied",
  "Have copied Skia headers? Run yarn run build to build and copy headers."
);

console.log("");

console.log("Building Android...");
const currentDir = process.cwd();
console.log("Entering example/android");
process.chdir("./example/android");
console.log("Cleaning build folders");
executeCmdSync("./gradlew :shopify_react-native-skia:clean");
console.log("Building...");
executeCmdSync("./gradlew :shopify_react-native-skia:assembleRelease");
console.log("Done building.");
process.chdir(currentDir);
