/* eslint-disable max-len */
import { configurations } from "./skia-configuration";
import { executeCmdSync, checkFileExists } from "./utils";

/**
 * This build script takes the prebuilt Skia Binaries and creates
 * iOS Fat Libraries (archives with all archs inside of one file).
 *
 * Requirements: Requires and tests that all Skia Binaries for the iOS
 * archs are built and available in the libs folder.
 *
 * This build script is run after the Skia Binaries are built.
 */

console.log("Building iOS Fat Libraries from Skia Binaries");
console.log("");

console.log("Checking prerequisites...");

// Check deps
Object.keys(configurations.ios.targets).forEach((targetKey) => {
  configurations.ios.outputNames.forEach((out) => {
    checkFileExists(
      `package/libs/ios/${targetKey}/${out}`,
      `package/libs/ios/${targetKey}/${out}`,
      `package/libs/ios/${targetKey}/${out} not found`
    );
  });
});

console.log("");
console.log("Prerequisites met. Starting build.");
console.log("");

console.log("Building fat binary for iphone simulator");
configurations.ios.outputNames.forEach((out) => {
  console.log(`Building fat binary for simulator for file ${out}`);
  executeCmdSync(
    `lipo -create package/libs/ios/x64/${out} package/libs/ios/arm64-iphonesimulator/${out} -output package/libs/ios/${
      out.split(".")[0]
    }.a`
  );
});

console.log("");
console.log("Building xcframeworks...");

configurations.ios.outputNames.forEach((out) => {
  const libName = out.split(".")[0];
  console.log(`Building ${libName}.xcframework`);
  executeCmdSync(`rm -rf ./package/libs/ios/${libName}.xcframework`);
  executeCmdSync(
    "xcodebuild -create-xcframework " +
      `-library ./package/libs/ios/${libName}.a ` +
      `-library ./package/libs/ios/arm64-iphoneos/${libName}.a ` +
      ` -output ./package/libs/ios/${libName}.xcframework `
  );
});

console.log("Frameworks successfully built.");