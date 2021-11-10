/* eslint-disable max-len */
import { execSync } from "child_process";

const executeCmdSync = (command: string) => {
  execSync(command, { stdio: "inherit", env: process.env });
};

executeCmdSync(
  "lipo -create package/libs/ios/arm/libskia.a package/libs/ios/arm64/libskia.a package/libs/ios/x64/libskia.a -output package/libs/ios/libskia.a"
);
executeCmdSync(
  "lipo -create package/libs/ios/arm/libsvg.a package/libs/ios/arm64/libsvg.a package/libs/ios/x64/libsvg.a -output package/libs/ios/libsvg.a"
);
executeCmdSync(
  "lipo -create package/libs/ios/arm/libskshaper.a package/libs/ios/arm64/libskshaper.a package/libs/ios/x64/libskshaper.a -output package/libs/ios/libskshaper.a"
);
