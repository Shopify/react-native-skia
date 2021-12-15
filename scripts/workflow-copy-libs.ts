import fs from "fs";
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
 * ./skia-ios-fat-libs:
 * libskia.a
 * libskshaper.a
 * libsvg.a
 */

console.log("Copying Skia Binaries from artifacts to libs folder");

const destinations = ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"];

const files = ["libskia.a", "libskshaper.a", "libsvg.a"];

const copyFiles = (from: string, to: string) => {
  files.forEach((f) =>
    fs.copyFileSync("./artifacts/" + from + "/" + f, to + "/" + f)
  );
};

console.log("Copying android files...");
destinations.forEach((d) => {
  copyFiles("skia-android-arm", "./package/libs/android/" + d);
});

console.log("Copying ios files...");
copyFiles("skia-ios-fat-libs", "./package/libs/ios");

console.log("Done copying artifacts.");
