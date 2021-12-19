/* eslint-disable max-len */
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

// Check that iOS Skia libs are built
["arm", "arm64", "x64"].forEach((cpu) =>
  ["libskia.a", "libskshaper.a", "libsvg.a"].forEach((lib) => {
    checkFileExists(
      `./package/libs/ios/${cpu}/${lib}`,
      `Skia iOS ${cpu}/${lib}`,
      "Have you built the Skia iOS binaries? Run yarn run build."
    );
  })
);

executeCmdSync(
  "lipo -create package/libs/ios/arm/libskia.a package/libs/ios/arm64/libskia.a package/libs/ios/x64/libskia.a -output package/libs/ios/libskia.a"
);
executeCmdSync(
  "lipo -create package/libs/ios/arm/libsvg.a package/libs/ios/arm64/libsvg.a package/libs/ios/x64/libsvg.a -output package/libs/ios/libsvg.a"
);
executeCmdSync(
  "lipo -create package/libs/ios/arm/libskshaper.a package/libs/ios/arm64/libskshaper.a package/libs/ios/x64/libskshaper.a -output package/libs/ios/libskshaper.a"
);
