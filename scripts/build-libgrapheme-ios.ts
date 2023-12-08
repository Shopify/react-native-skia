import os from "os";
import fs from "fs";
import { executeCmdSync } from "./utils";

// Build instructions for building  build-libgrapheme-ios
export const buildLibGraphemeiOS = async () => {
  // Empty the generate_headers.py file
  console.log("Patching the Skia buildscript 'generate_headers.py'...");
  const file = fs.openSync(
    "./third_party/libgrapheme/generate_headers.py",
    "w"
  );
  fs.writeSync(
    file,
    "print('[generate_headers.py] This file has been patched by the RN Skia build script.')"
  );
  fs.closeSync(file);
  console.log("Finished patching generate_headers.py.");

  console.log("Building libgrapheme for iOS...");

  // Change to the third_party/libgrapheme directory
  const currentDir = process.cwd();
  try {
    process.chdir("./third_party/externals/libgrapheme");
    // Check if the output has been created - if so skip the build
    if (!fs.existsSync("./gen/case.o")) {
      // Run configure
      console.log("Configuring libgrapheme...");
      executeCmdSync("./configure");
      // Up the file handle limit on mac:
      if (os.platform() === "darwin") {
        console.log(
          "Extending file handle count on Mac to avoid `Too many open files` error..."
        );
        executeCmdSync("ulimit -n 4096");
      }
      // Run make
      console.log("Building libgrapheme...");
      executeCmdSync("make");
      console.log("libgrapheme successfully built.");
    } else {
      console.log("Skipping configuring libgrapheme as it is already built.");
    }
  } finally {
    process.chdir(currentDir);
  }
};
