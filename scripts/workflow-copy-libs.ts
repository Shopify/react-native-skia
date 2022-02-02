import fs from "fs";
import { ensureFolderExists } from "./utils";
/**
 * This build script prepares the npm build command by copying
 * the Skia Binaries from the artifact folder into the libs folder
 * in the checkout directory. This build script is run by the
 * build-npm.yml workflow and does not require anything.
 *
 * The folder structure after downloading artifacts are:
 *
 * artifacts:
 *
 * ./skia-android-arm
 * ./skia-android-arm-64
 * ./skia-android-arm-x64
 * ./skia-android-arm-x86
 * ./skia-ios-fat-libs
 *
 * ./skia-android-arm:
 * libskia.a
 * libskshaper.a
 * libsvg.a
 *
 * ./skia-android-arm-64:
 * libskia.a
 * libskshaper.a
 * libsvg.a
 *
 * ./skia-android-arm-x64:
 * libskia.a
 * libskshaper.a
 * libsvg.a
 *
 * ./skia-android-arm-x86:
 * libskia.a
 * libskshaper.a
 * libsvg.a
 *
 * ./skia-ios-xc-frameworks:
 * libskia.xcframework
 * libskshaper.xcframework
 * libsvg.xcframework
 */

console.log("Copying Skia Binaries from artifacts to libs folder");

const sources = [
  "./skia-android-arm",
  "./skia-android-arm-64",
  "./skia-android-arm-x86",
  "./skia-android-arm-x64",
];

const destinations = ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"];

const files = ["libskia.a", "libskshaper.a", "libsvg.a"];

const copyFiles = (from: string, to: string) => {
  ensureFolderExists(to);
  files.forEach((f) => {
    const source = "./artifacts/" + from + "/" + f;
    const target = to + "/" + f;
    if (!fs.existsSync(source)) {
      console.log(
        "Copying failed, the artifact source",
        source,
        "was not found. Current dir is:",
        process.cwd()
      );
      process.exit(1);
    }
    if (!fs.existsSync(to)) {
      console.log(
        "Copying failed, the destination",
        to,
        "was not found. Current dir is:",
        process.cwd()
      );
      process.exit(1);
    }
    fs.copyFileSync(source, target);
    console.log("Copied", source, target);
  });
};

console.log("Copying android files...");
destinations.forEach((d, i) => {
  copyFiles(sources[i], "./package/libs/android/" + d);
});

console.log("Copying ios files...");
copyFiles("skia-ios-xcframeworks", "./package/libs/ios");

console.log("Done copying artifacts.");
