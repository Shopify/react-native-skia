import { existsSync } from "fs";

import { ensureFolderExists, copyRecursiveSync } from "./utils";
/**
 * This build script prepares the npm build command by copying
 * the Skia Binaries from the artifact folder into the libs folder
 * in the checkout directory. This build script is run by the
 * build-npm.yml workflow and does not require anything.
 */

console.log("Copying Skia Binaries from artifacts to libs folder");

const sources = [
  "./skia-android-arm",
  "./skia-android-arm-64",
  "./skia-android-arm-x86",
  "./skia-android-arm-x64",
];

const destinations = ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"];

const androidFiles = [
  "libskia.a",
  "libskshaper.a",
  "libsvg.a",
  "libskottie.a",
  "libsksg.a",
  "libskparagraph.a",
  "libskunicode_core.a",
  "libskunicode_icu.a",
  "libpathops.a",
  "libjsonreader.a",
];
const appleFiles = [
  "libskia.xcframework",
  "libskshaper.xcframework",
  "libsvg.xcframework",
  "libskottie.xcframework",
  "libsksg.xcframework",
  "libskparagraph.xcframework",
  "libskunicode_core.xcframework",
  "libskunicode_libgrapheme.xcframework",
  "libpathops.xcframework",
];

const copyFiles = (from: string, to: string, files: string[]) => {
  ensureFolderExists(to);
  files.forEach((f) => {
    const source = "./artifacts/" + from + "/" + f;
    const target = to + "/" + f;
    if (!existsSync(source)) {
      console.log(
        "Copying failed, the artifact source",
        source,
        "was not found. Current dir is:",
        process.cwd()
      );
      process.exit(1);
    }
    if (!existsSync(to)) {
      console.log(
        "Copying failed, the destination",
        to,
        "was not found. Current dir is:",
        process.cwd()
      );
      process.exit(1);
    }
    copyRecursiveSync(source, target);
    console.log("Copied", source, target);
  });
};

console.log("Copying android files...");
destinations.forEach((d, i) => {
  copyFiles(sources[i], "./libs/android/" + d, androidFiles);
});

console.log("Copying Apple files...");
copyFiles("skia-apple-xcframeworks", "./libs/apple", appleFiles);

console.log("Done copying artifacts.");
