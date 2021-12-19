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

// Check that iOS Skia libs are built
configurations.ios.cpus.forEach((cpu) =>
  configurations.ios.outputNames.forEach((lib) => {
    checkFileExists(
      `./package/libs/ios/${cpu}/${lib}`,
      `Skia iOS ${cpu}/${lib}`,
      "Have you built the Skia iOS binaries? Run yarn run build."
    );
  })
);

configurations.ios.outputNames.forEach((lib) => {
  const paths = configurations.ios.cpus.map((cpu) => `package/libs/ios/${cpu}/${lib}`).join(' ');
  executeCmdSync(
    `lipo -create ${paths} -output package/libs/ios/${lib}`
  );
});
